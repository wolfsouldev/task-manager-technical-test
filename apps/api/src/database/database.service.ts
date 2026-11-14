import { Injectable, OnModuleDestroy, OnModuleInit } from "@nestjs/common";
import { connect } from "./connection";

@Injectable()
export class DatabaseService implements OnModuleInit, OnModuleDestroy {
  private connection = connect();
  readonly store = this.connection.store;
  async onModuleInit() {
    await this.connection.initialize();
  }
  onModuleDestroy() {
    return this.connection.close();
  }
}
