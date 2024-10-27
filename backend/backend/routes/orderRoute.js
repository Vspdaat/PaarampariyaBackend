// const express = require('express');
// const { newOrder, getSingleOrderDetails, myOrders, getAllOrders, updateOrder, deleteOrder } = require('../controllers/orderController');
// const { isAuthenticatedUser, authorizeRoles } = require('../middlewares/auth');

// const router = express.Router();

// router.route('/order').post(isAuthenticatedUser, newOrder);
// // router.route('/order/:id').get(isAuthenticatedUser, getSingleOrderDetails);
// router.route('/order/:id').get(isAuthenticatedUser, async (req, res) => {
//     try {
//       const order = await order.findById(req.params.id);
//       if (!order) {
//         return res.status(404).json({ success: false, message: 'Order not found.' });
//       }
//       res.status(200).json({ success: true, order });
//     } catch (error) {
//       res.status(400).json({ success: false, message: 'Invalid Order ID' });
//     }
//   });
  
// router.route('/orders/me').get(isAuthenticatedUser, myOrders);

// router.route('/admin/orders').get(isAuthenticatedUser, authorizeRoles("admin"), getAllOrders);

// router.route('/admin/order/:id')
//     .put(isAuthenticatedUser, authorizeRoles("admin"), updateOrder)
//     .delete(isAuthenticatedUser, authorizeRoles("admin"), deleteOrder);

// module.exports = router;

const express = require('express');
const { newOrder, getSingleOrderDetails, myOrders, getAllOrders, updateOrder, deleteOrder } = require('../controllers/orderController');
const { isAuthenticatedUser, authorizeRoles } = require('../middlewares/auth');

const router = express.Router();

router.route('/order').post(isAuthenticatedUser, newOrder);
router.route('/order/:id').get(isAuthenticatedUser, getSingleOrderDetails);

router.route('/orders/me').get(isAuthenticatedUser, myOrders);
 
router.route('/admin/orders').get(getAllOrders);

router.route('/admin/order/:id')
    .put(isAuthenticatedUser, authorizeRoles("admin"), updateOrder)
    .delete(isAuthenticatedUser, authorizeRoles("admin"), deleteOrder);
    
module.exports = router;