import WalletService from "./wallet";
import { AppService } from "../util/svc";

import NodeService from "./node";
// import AnalyticsService from "./analytics";

let appService: AppService;

export const initServices = (): AppService => {
  if (!appService) {
    appService = new AppService();
    appService.add("node", new NodeService());
    appService.add("wallet", new WalletService());
    // appService.add("analytics", new AnalyticsService());
  }
  return appService;
};
