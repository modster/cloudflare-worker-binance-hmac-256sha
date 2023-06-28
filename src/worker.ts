export default {
  async fetch(
    request: Request,
    env: Env,
    ctx: ExecutionContext,
  ) {
    /**
     * Example someHost is set up to take in a JSON request
     * Replace url with the host you wish to send requests to
     * @param {string} someHost the host to send the request to
     * @param {string} url the URL to send the request to
     */
    const req = new URL(request.url);
    console.log(req.search.toString());
    const someHost = "https://testnet.binance.vision/api/v3";
    const url = someHost + "/order";
    const symbol = "BTCUSDT"
		const side = "BUY";
		const type = "MARKET";
		const quantity = "0.001";
		// const correct = "c8db56825ae71d6d79447849e617115f4a920fa2acdcab2b053c4b2838bd6b71";
		const searchParams = new URLSearchParams();
		searchParams.append("symbol", symbol);
		searchParams.append("side", side);
		searchParams.append("type", type);
		searchParams.append("quantity", quantity);
		searchParams.append("timestamp", Date.now().toString());
    const encoder = new TextEncoder();
    const apiSecret = encoder.encode("iCpRfVppnYf83lrzxPiH3emqY5hWjYoGcQfazCmShgs2RGyc8jTmVau0B0GVq3y2");
    const timestamp = Date.now().toString();

    const key = await crypto.subtle.importKey(
      "raw",
      apiSecret,
      { name: "HMAC", hash: "SHA-256" },
      false,
      ["sign"],
    );

    const mac = await crypto.subtle.sign(
      "HMAC",
      key,
      encoder.encode(searchParams.toString()),
    );

		const hashArray = Array.from(new Uint8Array(mac)); // convert buffer to byte array
		const hashHex = hashArray
			.map((b) => b.toString(16).padStart(2, "0"))
			.join(""); // convert bytes to hex string
    searchParams.append("signature", hashHex);

    /**
     * gatherResponse awaits and returns a response body as a string.
     * Use await gatherResponse(..) in an async function to get the response body
     * @param {Response} response
     */
    async function gatherResponse(response: Response): Promise<any> {
      const { headers } = response;
      const contentType = headers.get("content-type") || "";
      if (contentType.includes("application/json")) {
        return JSON.stringify(await response.json());
      }
      return response.text();
    }
		console.log(searchParams.toString());
    //"Content-Type", "application/x-www-form-urlencoded"?
    const initRequest = {
      method: "POST",
      headers: {
        "X-MBX-APIKEY": "CwFYlZxWm1v8PwfcxStd3UVDeNY9zcwWEx1yMzNvqILdBS3qhUF4umV3rs6VjWvR",
        "content-type": "application/x-www-form-urlencoded",
      },
      body:searchParams.toString(),
    };

    const initResponse = {
      headers: {
        "content-type": "application/json;charset=UTF-8",
      },
    };

    const response = await fetch(url, initRequest);
    const results = await gatherResponse(response);
    return new Response(results, initResponse);
  },
};
