import { describe, it, expect, vi, afterEach } from "vitest";

// We test the fetcher by mocking global fetch.
// The module uses ESM, so we mock before import via vi.stubGlobal.

describe("fetchJson", () => {
  afterEach(() => {
    vi.restoreAllMocks();
  });

  it("returns parsed JSON and totalPages from headers", async () => {
    const mockData = [{ id: 1, slug: "test" }];
    const mockResponse = {
      ok: true,
      status: 200,
      headers: {
        get: (name: string) => (name === "X-WP-TotalPages" ? "3" : null),
      },
      json: async () => mockData,
    };

    vi.stubGlobal("fetch", vi.fn().mockResolvedValue(mockResponse));

    // Dynamic import after stubbing so the module picks up the mock
    const { fetchJson } = await import("../src/fetcher.js");
    const result = await fetchJson("https://example.com/api");

    expect(result.data).toEqual(mockData);
    expect(result.totalPages).toBe(3);
  });

  it("defaults totalPages to 1 when header absent", async () => {
    const mockResponse = {
      ok: true,
      status: 200,
      headers: { get: () => null },
      json: async () => [],
    };

    vi.stubGlobal("fetch", vi.fn().mockResolvedValue(mockResponse));

    const { fetchJson } = await import("../src/fetcher.js");
    const result = await fetchJson("https://example.com/api");

    expect(result.totalPages).toBe(1);
  });

  it("throws on 404 (non-retryable)", async () => {
    const mockResponse = {
      ok: false,
      status: 404,
      headers: { get: () => null },
      json: async () => ({}),
    };

    vi.stubGlobal("fetch", vi.fn().mockResolvedValue(mockResponse));

    const { fetchJson } = await import("../src/fetcher.js");

    await expect(fetchJson("https://example.com/missing")).rejects.toThrow(
      "HTTP 404"
    );
  });
});

describe("fetchBinary", () => {
  afterEach(() => {
    vi.restoreAllMocks();
  });

  it("returns a Buffer from binary response", async () => {
    const fakeData = new Uint8Array([0x89, 0x50, 0x4e, 0x47]); // PNG magic bytes
    const mockResponse = {
      ok: true,
      status: 200,
      headers: { get: () => null },
      arrayBuffer: async () => fakeData.buffer,
    };

    vi.stubGlobal("fetch", vi.fn().mockResolvedValue(mockResponse));

    const { fetchBinary } = await import("../src/fetcher.js");
    const buffer = await fetchBinary("https://example.com/image.jpg");

    expect(Buffer.isBuffer(buffer)).toBe(true);
    expect(buffer[0]).toBe(0x89);
  });
});
