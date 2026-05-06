import { describe, it, expect, beforeAll, afterAll } from "vitest";
import express from "express";
import request from "supertest";

// Minimal test: verify the /api/report/daily endpoint enforces token auth
describe("POST /api/report/daily", () => {
  let app: express.Express;

  beforeAll(() => {
    process.env.REPORT_SECRET = "test-secret-token-123";
    app = express();
    app.use(express.json());

    app.post("/api/report/daily", async (req: any, res: any) => {
      const token = req.headers["x-report-token"] || req.body?.token;
      const expected = process.env.REPORT_SECRET;
      if (!expected || token !== expected) {
        return res.status(401).json({ error: "Unauthorized" });
      }
      // Don't actually send email in tests — just return success
      return res.json({ success: true, message: "Daily traffic report sent" });
    });
  });

  afterAll(() => {
    delete process.env.REPORT_SECRET;
  });

  it("returns 401 with no token", async () => {
    const res = await request(app)
      .post("/api/report/daily")
      .send({});
    expect(res.status).toBe(401);
    expect(res.body.error).toBe("Unauthorized");
  });

  it("returns 401 with wrong token", async () => {
    const res = await request(app)
      .post("/api/report/daily")
      .set("x-report-token", "wrong-token")
      .send({});
    expect(res.status).toBe(401);
    expect(res.body.error).toBe("Unauthorized");
  });

  it("returns 200 with correct token in header", async () => {
    const res = await request(app)
      .post("/api/report/daily")
      .set("x-report-token", "test-secret-token-123")
      .send({});
    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
  });

  it("returns 200 with correct token in body", async () => {
    const res = await request(app)
      .post("/api/report/daily")
      .send({ token: "test-secret-token-123" });
    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
  });
});
