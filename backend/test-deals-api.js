const fetch = require("node-fetch"); // Using native fetch in node v22

async function test() {
  try {
    // 1. Get Token
    const loginRes = await fetch("http://localhost:5000/api/auth/login", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        email: "admin@builders.com",
        password: "password123",
      }),
    });

    // If admin@builders.com fails, try what usually exists
    const loginData = await loginRes.json();
    let token = loginData.token;

    if (!token) {
      // fallback common credentials
      const res2 = await fetch("http://localhost:5000/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          email: "admin@test.com",
          password: "password123",
        }),
      });
      token = (await res2.json()).token;
    }

    if (!token) {
      console.log("Could not log in");
      return;
    }

    // 2. Fetch Deals
    const dealsRes = await fetch("http://localhost:5000/api/deals", {
      headers: { Authorization: `Bearer ${token}` },
    });
    const dealsData = await dealsRes.json();
    console.log("Deals Response:", JSON.stringify(dealsData, null, 2));
  } catch (e) {
    console.error("Test Error:", e);
  }
}

test();
