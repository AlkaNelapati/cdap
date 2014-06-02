package com.continuuity.hive.guice;

import com.continuuity.common.runtime.RuntimeModule;
import com.continuuity.hive.server.HiveServer;
import com.continuuity.hive.server.MockHiveServer;
import com.google.inject.AbstractModule;
import com.google.inject.Module;

/**
 * Mock hive servers used when Hive is not installed.
 */
public class MockHiveRuntimeModule extends RuntimeModule {
  @Override
  public Module getInMemoryModules() {
    return mock();
  }

  @Override
  public Module getSingleNodeModules() {
    return mock();
  }

  @Override
  public Module getDistributedModules() {
    return mock();
  }

  private Module mock() {
    return new AbstractModule() {
      @Override
      protected void configure() {
        bind(HiveServer.class).to(MockHiveServer.class);
      }
    };
  }
}
