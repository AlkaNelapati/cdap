/*
 * Copyright © 2016 Cask Data, Inc.
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

package co.cask.cdap.etl.spark.function;

import co.cask.cdap.api.metrics.Metrics;
import co.cask.cdap.etl.api.StageMetrics;
import co.cask.cdap.etl.common.DefaultStageMetrics;
import org.apache.spark.api.java.function.Function;

/**
 * Function that doesn't transform anything, but just emits counts for the number of records from that stage.
 *
 * @param <T> the type of input object
 */
public class CountingFunction<T> implements Function<T, T> {
  private final String stageName;
  private final Metrics metrics;
  private final String metricName;
  private transient StageMetrics stageMetrics;

  public CountingFunction(String stageName, Metrics metrics, String metricName) {
    this.stageName = stageName;
    this.metrics = metrics;
    this.metricName = metricName;
  }

  @Override
  public T call(T in) throws Exception {
    if (stageMetrics == null) {
      stageMetrics = new DefaultStageMetrics(metrics, stageName);
    }
    stageMetrics.count(metricName, 1);
    return in;
  }
}
