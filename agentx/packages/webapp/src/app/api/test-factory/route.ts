import { NextRequest, NextResponse } from 'next/server';

export async function GET(request: NextRequest) {
  try {
    console.log("🔍 Testing Factory from frontend...");
    
    const factoryAddress = "0x7FC62946f03f42c721ae0237998c45b64872aD26";
    const marketplaceAddress = "0x431c7146aFc6675610383Bf60701ad3ceAe30cE7";
    
    const response = {
      success: true,
      factoryAddress,
      marketplaceAddress,
      message: "Factory addresses are configured",
      testTransaction: {
        to: factoryAddress,
        value: "0.01",
        functionName: "createAgent",
        args: [
          "Test Agent",
          "Test Description", 
          "General",
          "gpt-4",
          "test-hash",
          ["AI", "Test"],
          "0.075" // price in ETH
        ]
      }
    };
    
    return NextResponse.json(response);
  } catch (error) {
    console.error("Factory test error:", error);
    return NextResponse.json({ 
      success: false, 
      error: error instanceof Error ? error.message : "Unknown error" 
    }, { status: 500 });
  }
}
