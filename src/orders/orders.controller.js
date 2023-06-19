const path = require("path");

// Use the existing order data
const orders = require(path.resolve("src/data/orders-data"));

// Use this function to assigh ID's when necessary
const nextId = require("../utils/nextId");

function list(req, res) {
  res.json({ data: orders });
}
function fakeId(req, res, next) {
  let {
    data: { id },
  } = req.body;
  let { orderId } = req.params;
  if (id === orderId) {
    return next();
  } else if (id === undefined || id === null || id === "") {
    order = orderId;
    return next();
  } else {
    next({
      status: 400,
      message: `Order id does not match route id. Order: ${id}, Route: ${orderId}.`,
    });
  }
}

function dataExists(propertyName) {
  return function (req, res, next) {
    const { data = {} } = req.body;
    if (data[propertyName]) {
      return next();
    }
    next({ status: 400, message: `Must include a ${propertyName}` });
  };
}

function dishChecker(req, res, next) {
  const {
    data: { dishes },
  } = req.body;
  if (!Array.isArray(dishes) || !dishes.length) {
    return next({
      status: 400,
      message: "Must include valid dish",
    });
  }

  const indexOfBadDish = dishes.findIndex(
    (dish) => !dish.quantity || !Number.isInteger(dish.quantity)
  );
  if (indexOfBadDish !== -1) {
    return next({
      status: 400,
      message: `Dish ${indexOfBadDish} must have a quantity that is an integer greater than 0`,
    });
  } else {
    return next();
  }
}

function validStatus(req, res, next) {
  const {
    data: { status },
  } = req.body;
  if (status === "delivered") {
    return next({
      status: 400,
      message: "A delivered order cannot be changed",
    });
  } else if (
    status === "pending" ||
    status === "preparing" ||
    status === "out-for-delivery"
  ) {
    next();
  } else {
    return next({
      status: 400,
      message:
        "Order must have a status of pending, preparing, out-for-delivery, delivered",
    });
  }
}

function create(req, res) {
  const { data: { id, deliverTo, mobileNumber, status, dishes } = {} } =
    req.body;
  const newOrder = {
    id: nextId(),
    deliverTo,
    mobileNumber,
    status: "pending",
    dishes,
  };
  orders.push(newOrder);
  res.status(201).json({ data: newOrder });
}

function read(req, res, next) {
  const { orderId } = req.params;
  const foundOrder = orders.find(({ id }) => id === orderId);
  if (foundOrder) {
    res.json({ data: foundOrder });
  } else
    next({
      status: 404,
      message: `${orderId} not found`,
    });
}

function update(req, res, next) {
  const { orderId } = req.params;
  const foundOrder = orders.find(({ id }) => id === orderId);
  const { data: { id, deliverTo, mobileNumber, status, dishes } = {} } =
    req.body;
  if (foundOrder) {
    foundOrder.id = orderId;
    foundOrder.deliverTo = deliverTo;
    foundOrder.mobileNumber = mobileNumber;
    foundOrder.status = status;
    foundOrder.dishes = dishes;
    res.json({ data: foundOrder });
  } else {
    next({
      status: 404,
      message: `Dish does not exist: ${dishId}`,
    });
  }
}
function orderExists(req, res, next) {
  const { orderId } = req.params;
  const foundOrder = orders.find((order) => order.id === orderId);
  if (foundOrder) {
    return next();
  }
  next({
    status: 404,
    message: `Order not found: ${orderId}`,
  });
}

function orderIsPending(req, res, next) {
  const { orderId } = req.params;
  const foundOrder = orders.find((order) => order.id === orderId);
  if (foundOrder.status !== "pending") {
    next({
      status: 400,
      message: "pending",
    });
  } else {
    return next();
  }
}

function terminate(req, res, next) {
  const { orderId } = req.params;
  const index = orders.findIndex((order) => order.id === orderId);
  if (index == -1) {
    return next({
      status: 404,
      message: `Order not found: ${orderId}`,
    });
  }
  orders.splice(index, 1);

  res.sendStatus(204);
}

module.exports = {
  list,
  create: [
    dataExists("deliverTo"),
    dataExists("mobileNumber"),
    dataExists("dishes"),
    dishChecker,
    create,
  ],
  read,
  update: [
    orderExists,
    dataExists("deliverTo"),
    dataExists("mobileNumber"),
    dataExists("dishes"),
    dataExists("status"),
    validStatus,
    dishChecker,
    fakeId,
    update,
  ],
  delete: [orderExists, orderIsPending, terminate],
};
