import { z } from "zod";
import readFileByLine from "../../../utils/file/readFileByLine";
import logger from "../../../utils/other/logger";
import createUnionSchema from "../../../utils/zod/createUnionSchema";
import CHAIN_NAMES from "../../../constants/chainNames";
import DmailSendMailAction from "../../../action/random/dmailSendMail";
import getSwapActions from "./getSwapActions";
import SwapAction from "../../../action/swap/base";

class ActionFactory {
  private readonly actionsFileName: string;
  private _actionIds: string[];
  public readonly swapActions: SwapAction[];

  public constructor(params: { actionsFileName: string }) {
    const { actionsFileName } = params;
    this.actionsFileName = actionsFileName;
    this._actionIds = this.getFileActionIds();

    this.swapActions = getSwapActions();
  }

  private getFileActionIds() {
    return readFileByLine(this.actionsFileName)
      .map((o) => o.trim())
      .filter((o) => Boolean(o) && !o.startsWith("#"));
  }

  private getActionIds() {
    try {
      this._actionIds = this.getFileActionIds();
    } catch (error) {
      const message = (error as Error).message;

      logger.error(
        `used the previous actions value due to an error. Details: ${message}`,
      );
    }

    return this._actionIds;
  }

  private getActiveActions() {
    const actionIds = this.getActionIds();

    const parsedActionIds = actionIds.map(parseOp)

    const invalidActionIds = [];
    const swapActions = [];

    for(const )

  }
}
