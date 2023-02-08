import { AppService } from "../../util/svc";
import NodeService from "./node";
import SettingsService from "./settings";
import WalletService from "./wallet";
// import AnalyticsService from "./analytics";

let appService: AppService;

export const initServices = (): AppService => {
  if (!appService) {
    console.log("starting up");
    appService = new AppService();
    appService.add("node", new NodeService());
    appService.add("setting", new SettingsService());
    appService.add("wallet", new WalletService());
    appService.start();
    // appService.add("analytics", new AnalyticsService());
  } else {
    console.log("grabbing singleton");
  }

  return appService;
};
