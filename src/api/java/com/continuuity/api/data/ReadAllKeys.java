package com.continuuity.api.data;

import com.google.common.base.Objects;

/**
 * Read all keys and rows.
 *
 * Supports both key-value and columnar operations.
 */
public class ReadAllKeys implements ReadOperation {

  /** the name of the table */
  private final String table;

  /** The number of keys to offset by */
  private final int offset;

  /** The maximum number of keys to return */
  private final int limit;

  /**
   * Reads all of the keys and rows in the range specified by the given offset
   * and limit, from the default table.
   *
   * @param offset number of keys to offset by
   * @param limit maximum number of keys to return
   */
  public ReadAllKeys(int offset,
                     int limit) {
    this(null, offset, limit);
  }

  /**
   * Reads all of the keys and rows in the range specified by the given offset
   * and limit, from the specified table.
   *
   * @param table the name of the table to read from
   * @param offset number of keys to offset by
   * @param limit maximum number of keys to return
   */
  public ReadAllKeys(String table,
                     int offset,
                     int limit) {
    this.table = table;
    this.offset = offset;
    this.limit = limit;
  }

  public String getTable() {
    return this.table;
  }

  public int getOffset() {
    return this.offset;
  }

  public int getLimit() {
    return this.limit;
  }

  public String toString() {
    return Objects.toStringHelper(this)
        .add("offset", Integer.toString(offset))
        .add("limit", Integer.toString(limit))
        .toString();
  }
}
