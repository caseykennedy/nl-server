import WalletService from "./wallet";
import { AppService } from "../../util/svc";

import NodeService from "./node";
import SettingService from "./setting";
// import AnalyticsService from "./analytics";

let appService: AppService;

export const initServices = (): AppService => {
  if (!appService) {
    console.log('starting up')
    appService = new AppService();
    appService.add("node", new NodeService());
    appService.add("setting", new SettingService());    
    appService.add("wallet", new WalletService());
    appService.start();
    // appService.add("analytics", new AnalyticsService());
} else {
    console.log('grabbing singleton')
}
  
  return appService;
};
