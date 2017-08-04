/*
 * Copyright © 2017 Cask Data, Inc.
 *
 * Licensed under the Apache License, Version 2.0 (the "License"); you may not
 * use this file except in compliance with the License. You may obtain a copy of
 * the License at
 *
 * http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS, WITHOUT
 * WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied. See the
 * License for the specific language governing permissions and limitations under
 * the License.
 */

package co.cask.cdap.metrics.process;

import co.cask.cdap.api.common.Bytes;
import co.cask.cdap.api.dataset.table.Row;
import co.cask.cdap.api.dataset.table.Scanner;
import co.cask.cdap.common.conf.CConfiguration;
import co.cask.cdap.common.conf.Constants;
import co.cask.cdap.data2.dataset2.lib.table.MetricsTable;
import co.cask.cdap.metrics.store.MetricDatasetFactory;
import co.cask.cdap.metrics.store.upgrade.DataMigrationException;
import co.cask.cdap.proto.id.NamespaceId;
import org.apache.hadoop.conf.Configuration;
import org.apache.hadoop.hbase.HTableDescriptor;
import org.apache.hadoop.hbase.client.HBaseAdmin;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;

import java.util.Map;
import java.util.NavigableMap;
import java.util.Set;
import java.util.SortedMap;
import java.util.TreeMap;

/**
 * perform table data migration from v2 metrics table to v3.
 */
public class MetricsTableMigration {
  private static final Logger LOG = LoggerFactory.getLogger(MetricsTableMigration.class);
  private static final int MAX_RECORDS_TO_SCAN = 10;
  private static final int MAX_COLUMN_ENTRIES_TO_SCAN = 100;

  private final MetricsTable v2MetricsTable;
  private final MetricsTable v3MetricsTable;
  private final Configuration hConf;
  private final CConfiguration cConf;

  public MetricsTableMigration(MetricDatasetFactory metricDatasetFactory, int resolution,
                               CConfiguration cConf, Configuration hConf) {
    this(metricDatasetFactory.getV2MetricsTable(resolution),
         metricDatasetFactory.getV3MetricsTable(resolution), cConf, hConf);
  }

  public MetricsTableMigration(MetricsTable v2MetricsTable, MetricsTable v3MetricsTable,
                               CConfiguration cConf, Configuration hConf) {
    this.v2MetricsTable = v2MetricsTable;
    this.v3MetricsTable = v3MetricsTable;
    this.cConf = cConf;
    this.hConf = hConf;
  }

  /**
   * returns true if old metrics data is still available for transfer
   * @return
   */
  public boolean isOldMetricsDataAvailable() {
    Scanner scanner = v2MetricsTable.scan(null, null, null);
    Row row = scanner.next();
    scanner.close();
    return (row != null);
  }

  public void transferData() {
    LOG.info("Running Metrics Migrator Thread");
    Scanner scanner = v2MetricsTable.scan(null, null, null);
    Row row;
    int recordsScanned = 0;
    int entriesScanned = 0;

    while (((row = scanner.next()) != null) && (recordsScanned < MAX_RECORDS_TO_SCAN) &&
      (entriesScanned < MAX_COLUMN_ENTRIES_TO_SCAN)) {
      if (recordsScanned % 10 == 0) {
        LOG.info("Scanned {} records in Metrics Data Migration", recordsScanned);
      }

      byte[] rowKey = row.getRow();
      Map<byte[], byte[]> columns = row.getColumns();
      //row-map
      // todo should we use bytes comparator or something else ?
      SortedMap<byte[], SortedMap<byte[], Long>> rowGauges = new TreeMap<>(Bytes.BYTES_COMPARATOR);
      NavigableMap<byte[], NavigableMap<byte[], Long>> rowIncrements = new TreeMap<>(Bytes.BYTES_COMPARATOR);

      // column-map gauges
      SortedMap<byte[], Long> gauges = new TreeMap<>(Bytes.BYTES_COMPARATOR);
      // column-map increments
      NavigableMap<byte[], Long> increments = new TreeMap<>(Bytes.BYTES_COMPARATOR);

      //LOG.info("Iterating through columns for rowkey {}.. column size {}", rowKey, columns.size());

      for (Map.Entry<byte[], byte[]> entry : columns.entrySet()) {
        entriesScanned++;
        // column is timestamp, do a get on the new table
        byte[] value = v3MetricsTable.get(rowKey, entry.getKey());
        //LOG.info("Got value {} from v3 table for rowkey {} and column {}", value, rowKey, entry.getKey());
        if (value == null) {
          gauges.put(entry.getKey(), Bytes.toLong(entry.getValue()));
        } else {
          increments.put(entry.getKey(), Bytes.toLong(entry.getValue()));
        }
      }

      LOG.info("Size of gauges map is {}", gauges.size());

      byte[][] deletes = getByteArrayFromSets(increments.keySet(), gauges.keySet());

      if (deletes.length > 0) {
        v2MetricsTable.delete(rowKey, deletes);
      }

      if (!gauges.isEmpty()) {
        rowGauges.put(rowKey, gauges);
        v3MetricsTable.put(rowGauges);
      }

      // increments
      if (!increments.isEmpty()) {
        rowIncrements.put(rowKey, increments);
        v3MetricsTable.increment(rowIncrements);
      }
      // delete entries from old table
      // break if we have exceeded max records to scan
      recordsScanned++;
    }
    scanner.close();
    LOG.info("Migrated {} records from the metrics table {}", recordsScanned, v2MetricsTable);
  }

  private byte[][] getByteArrayFromSets(Set<byte[]> incrementSet, Set<byte[]> gaugeSet) {
    byte [][] deletes = new byte[incrementSet.size() + gaugeSet.size()][];
    int index = 0;
    for (byte[] column : incrementSet) {
      deletes[index++] = column;
    }
    for (byte[] column : gaugeSet) {
      deletes[index++] = column;
    }
    return deletes;
  }

  private String getV2MetricsTableName(int resolution) {

    String v2TableName = cConf.get(Constants.Metrics.METRICS_TABLE_PREFIX,
                                   Constants.Metrics.DEFAULT_METRIC_TABLE_PREFIX) + ".ts." + resolution;
    // todo add root prefix etc before returning
    return NamespaceId.SYSTEM.dataset(v2TableName).getDataset();
  }

  private void deleteTable(String tableName) throws DataMigrationException {
    try (HBaseAdmin hAdmin = new HBaseAdmin(hConf)) {
      for (HTableDescriptor desc : hAdmin.listTables()) {
        if (desc.getNameAsString().equals(tableName)) {
          // disable the table
          hAdmin.disableTable(desc.getName());
          // delete the table
          hAdmin.deleteTable(desc.getName());
        }
      }
    } catch (Exception e) {
      LOG.error("Exception while trying to delete old metrics tables", e);
      throw new DataMigrationException("Failed deleting old metrics tables");
    }
  }
}
