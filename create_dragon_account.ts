import { initializeHostAccount } from "./server/hostAuth";

const result = await initializeHostAccount(390001, "254996071@qq.com");
console.log("Result:", JSON.stringify(result, null, 2));
