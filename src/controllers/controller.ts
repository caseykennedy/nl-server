import { AppService } from "../util/svc";
import { MessageAction } from "../api/base";
import { controllers } from "./actions";
import { initServices } from "./background";

export async function messageListener(message: MessageAction): Promise<string> {
  const app = initServices();
  const res = handleMessage(app, message);
  //   console.log("message received:", message);
  return new Promise((resolve) => resolve(res));
}

async function handleMessage(app: AppService, message: MessageAction) {
  const controller = controllers[message.type];

  if (controller) {
    return controller(app, message);
  }
}
