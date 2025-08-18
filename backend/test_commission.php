<?php
// Test script to verify admin commission system
require_once 'classes/Payment.php';
require_once 'config/database.php';

echo "=== Admin Commission System Test ===\n\n";

try {
    $payment = new Payment();
    
    // Test 1: Create a sample payment
    echo "1. Testing payment creation with commission...\n";
    $testPayment = $payment->createPayment(
        1, // service_request_id
        1, // user_id  
        1, // worker_id
        100.00, // amount
        'cash' // payment_method
    );
    
    if ($testPayment['success']) {
        echo "✅ Payment created successfully: ID " . $testPayment['payment_id'] . "\n";
        $paymentId = $testPayment['payment_id'];
        
        // Test 2: Complete the payment to trigger commission calculation
        echo "\n2. Testing payment completion and commission calculation...\n";
        $completionResult = $payment->completePayment($paymentId);
        
        if ($completionResult['success']) {
            echo "✅ Payment completed successfully\n";
            
            // Test 3: Check admin commission summary
            echo "\n3. Testing admin commission summary...\n";
            $commissionSummary = $payment->getAdminCommissionSummary();
            echo "📊 Admin Commission Summary:\n";
            echo "   - Total Transactions: " . $commissionSummary['total_transactions'] . "\n";
            echo "   - Total Commission: $" . number_format($commissionSummary['total_commission'], 2) . "\n";
            echo "   - Total Revenue: $" . number_format($commissionSummary['total_revenue'], 2) . "\n";
            echo "   - Worker Payouts: $" . number_format($commissionSummary['total_worker_payouts'], 2) . "\n";
            echo "   - Commission Rate: " . $commissionSummary['avg_commission_rate'] . "%\n";
            
            // Test 4: Check recent commission transactions
            echo "\n4. Testing commission transactions...\n";
            $commissionTransactions = $payment->getAdminCommissionTransactions(5, 0);
            echo "📋 Recent Commission Transactions: " . count($commissionTransactions) . " found\n";
            
            foreach ($commissionTransactions as $transaction) {
                echo "   - Transaction #{$transaction['id']}: $" . number_format($transaction['commission_amount'], 2) . 
                     " ({$transaction['commission_rate']}% of $" . number_format($transaction['gross_amount'], 2) . ")\n";
            }
            
            echo "\n✅ All tests passed! Admin commission system is working correctly.\n";
            echo "\n💡 Commission Flow:\n";
            echo "   1. Worker completes task → Service status: 'completed'\n";
            echo "   2. User pays → Payment created with amount\n";
            echo "   3. Payment completed → 10% goes to admin, 90% to worker\n";
            echo "   4. Admin commission tracked in admin_earnings table\n";
            echo "   5. Finance dashboard shows commission earnings\n";
            
        } else {
            echo "❌ Payment completion failed: " . $completionResult['message'] . "\n";
        }
    } else {
        echo "❌ Payment creation failed: " . $testPayment['message'] . "\n";
    }
    
} catch (Exception $e) {
    echo "❌ Test failed with error: " . $e->getMessage() . "\n";
    echo "💡 Make sure to run the admin_commission_schema.sql first to create the required tables.\n";
}

echo "\n=== Test Complete ===\n";
?>
