import React, { useState } from 'react';
import { Play, RotateCcw, CheckCircle2, ChevronRight, Zap, Info } from 'lucide-react';

export default function DemoGuideBar({ db, dbState, onTriggerStep }) {
  const [isRunningAuto, setIsRunningAuto] = useState(false);
  const [activeStepIndex, setActiveStepIndex] = useState(0);

  // Find Order #1001 or latest demo order
  const demoOrder = dbState.orders.find(o => o.orderId === 'ORDER_1001') || dbState.orders[0];

  const steps = [
    {
      num: 1,
      title: "Student Orders",
      desc: "Pick Block B ➔ Campus Stationery Store ➔ Add Record Book (₹80) + Pen (₹10) ➔ Place Order",
      statusCheck: () => Boolean(demoOrder)
    },
    {
      num: 2,
      title: "Store Receives",
      desc: "Instant audio alert rings on Store Owner Dashboard for Order #1001 (₹90)",
      statusCheck: () => Boolean(demoOrder && demoOrder.status !== 'Rejected')
    },
    {
      num: 3,
      title: "Status Transitions",
      desc: "Owner clicks [Accept] ➔ 'Preparing' ➔ 'Ready' ➔ 'Out for Delivery' ➔ 'Delivered'",
      statusCheck: () => Boolean(demoOrder && demoOrder.status === 'Delivered')
    },
    {
      num: 4,
      title: "Real-Time Sync",
      desc: "Student tracking screen and map coordinates update live with zero refresh",
      statusCheck: () => Boolean(demoOrder && demoOrder.status === 'Delivered')
    }
  ];

  // Automated 1-Click Demonstration Script
  const runAutoDemo = async () => {
    if (isRunningAuto) return;
    setIsRunningAuto(true);

    try {
      // Step 1: Reset & Ensure fresh state
      db.resetToDemo();
      await new Promise(r => setTimeout(r, 600));

      // Step 2: Student places Order #1001 for ₹90
      const order = db.placeOrder({
        userId: 'user_thejas_01',
        storeId: 'store_stationery_01',
        studentName: 'Thejas Gowda',
        phone: '+91 98765 43210',
        hostelBlock: 'Block B',
        roomNumber: '204',
        paymentMethod: 'COD',
        items: [
          { productId: 'prod_record_book', name: 'Record Book (₹80)', price: 80, qty: 1 },
          { productId: 'prod_pen_blue', name: 'Pen (₹10)', price: 10, qty: 1 }
        ],
        totalAmount: 90
      });

      // Step 3: Owner accepts order
      await new Promise(r => setTimeout(r, 1400));
      db.updateOrderStatus(order.orderId, 'Accepted');

      // Step 4: Owner prepares order
      await new Promise(r => setTimeout(r, 1400));
      db.updateOrderStatus(order.orderId, 'Preparing');

      // Step 5: Ready for pickup
      await new Promise(r => setTimeout(r, 1400));
      db.updateOrderStatus(order.orderId, 'Ready');

      // Step 6: Out for delivery
      await new Promise(r => setTimeout(r, 1600));
      db.updateOrderStatus(order.orderId, 'Out for Delivery');

      // Step 7: Delivered
      await new Promise(r => setTimeout(r, 2200));
      db.updateOrderStatus(order.orderId, 'Delivered');

    } catch (e) {
      console.error('Demo execution error:', e);
    } finally {
      setIsRunningAuto(false);
    }
  };

  return (
    <div className="demo-guide-strip">
      <div className="guide-left">
        <div className="badge-evaluation">
          <Zap size={14} className="fill-amber text-amber" />
          <span>Demonstration Workflow:</span>
        </div>
        <div className="steps-flow-summary">
          {steps.map((s, idx) => {
            const isDone = s.statusCheck();
            return (
              <div key={s.num} className={`guide-step-chip ${isDone ? 'done' : ''}`}>
                <span className="step-num">{s.num}</span>
                <span className="step-label">{s.title}</span>
                {idx < steps.length - 1 && <ChevronRight size={13} className="chip-sep" />}
              </div>
            );
          })}
        </div>
      </div>

      <div className="guide-actions">
        <button 
          type="button" 
          onClick={runAutoDemo} 
          disabled={isRunningAuto}
          className={`btn-auto-demo ${isRunningAuto ? 'running' : ''}`}
          title="Run complete end-to-end demonstration automatically"
        >
          <Play size={14} className={isRunningAuto ? 'animate-spin' : ''} />
          <span>{isRunningAuto ? 'Simulating Workflow...' : '⚡ 1-Click Auto Demo'}</span>
        </button>

        <button 
          type="button" 
          onClick={() => db.resetToDemo()} 
          className="btn-reset-demo"
          title="Reset to fresh demo state with Order #1001 sequence ready"
        >
          <RotateCcw size={14} />
          <span>Reset Demo</span>
        </button>
      </div>
    </div>
  );
}
