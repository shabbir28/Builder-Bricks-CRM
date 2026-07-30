const axios = require("axios");

async function testAuth() {
  try {
    console.log("Testing login...");
    const loginRes = await axios.post("http://localhost:5000/api/auth/login", {
      email: "admin@estatecrm.pk",
      password: "admin123@password",
    });

    const token = loginRes.data.data.token;
    console.log("Login successful. Token acquired.");

    console.log("Testing dashboard stats with token...");
    const statsRes = await axios.get(
      "http://localhost:5000/api/dashboard/stats",
      {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      },
    );

    console.log("Dashboard stats success:", statsRes.data.success);
    console.log("Data summary:", Object.keys(statsRes.data.data));
  } catch (err) {
    console.error("Test failed!");
    if (err.response) {
      console.error("Status:", err.response.status);
      console.error("Message:", err.response.data.message);
    } else {
      console.error(err.message);
    }
  }
}

testAuth();
