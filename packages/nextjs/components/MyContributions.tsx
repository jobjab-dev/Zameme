'use client';

export function MyContributions() {
  return (
    <div>
      <div className="bg-yellow-400 text-black p-6 rounded-lg mb-6">
        <div className="flex items-center gap-4">
          <div className="text-4xl">🔒</div>
          <div>
            <h3 className="font-black text-xl">Your Private Contributions</h3>
            <p className="text-sm">Only you can decrypt and view your amounts using EIP-712 signature</p>
          </div>
        </div>
      </div>

      <div className="text-center py-12 text-gray-400">
        <p>Your contributions will appear here</p>
        <p className="text-sm mt-2">Contribute to a launch to see your private receipts</p>
      </div>
    </div>
  );
}

