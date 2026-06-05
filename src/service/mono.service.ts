import axios from "axios";
import User from "../models/User.ts";


const MONO_BASE_URL = "https://api.withmono.com/v2";

export class MonoService {
  private headers = {
    "mono-sec-key": process.env.MONO_SECRET_KEY!,
    "Content-Type": "application/json",
  };

  // Exchange code from MonoConnect widget
  async exchangeToken(code: string, userId: string) {
    const { data } = await axios.post(
      `${MONO_BASE_URL}/accounts/auth`,
      { code },
      { headers: this.headers }
    );

    const { id: accountId, access_token } = data.data;

    await User.findByIdAndUpdate(userId, {
      $push: {
        monoTokens: {
          accountId,
          accessToken: access_token,
          expiresAt: new Date(Date.now() + 360 * 24 * 60 * 60 * 1000), // ~1 year
        },
      },
    });

    // Trigger initial sync
    await this.syncTransactions(userId, accountId);
    return { accountId, access_token };
  }

  async syncTransactions(userId: string, accountId: string) {
    // Get transactions
    const { data } = await axios.get(
      `${MONO_BASE_URL}/accounts/${accountId}/transactions`,
      { headers: this.headers }
    );

    // Process and save to Transaction model (implement Transaction model similarly)
    // ... logic for auto-categorization
  }

  async getAccountBalance(accountId: string) {
    const { data } = await axios.get(
      `${MONO_BASE_URL}/accounts/${accountId}/balance`,
      { headers: this.headers }
    );
    return data;
  }
}

export const monoService = new MonoService();