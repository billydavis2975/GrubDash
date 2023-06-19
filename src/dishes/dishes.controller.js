const path = require("path");

// Use the existing dishes data
const dishes = require(path.resolve("src/data/dishes-data"));

// Use this function to assign ID's when necessary
const nextId = require("../utils/nextId");

// TODO: Implement the /dishes handlers needed to make the tests pass
function list(req, res) {
  res.json({ data: dishes });
}
function priceIsValid(req, res, next) {
  const {
    data: { price },
  } = req.body;
  if (Number.isInteger(price) && price > 0) {
    return next();
  } else {
    next({
      status: 400,
      message: "Dish must have a price that is an integer greater than 0",
    });
  }
}
function dishExists(req, res, next) {
  const { dishId } = req.params;
  res.locals.foundDish = dishes.find(({ id }) => id === dishId);
  if (!res.locals.foundDish) {
    next({
      status: 404,
      message: `Dish does not exist: ${dishId}`,
    });
  } else {
    next();
  }
}

function fakeId(req, res, next) {
  let {
    data: { id },
  } = req.body;
  let { dishId } = req.params;
  if (id === dishId) {
    return next();
  } else if (id === undefined || id === null || id === "") {
    dish = dishId;
    return next();
  } else {
    next({
      status: 400,
      message: `Dish id does not match route id. Dish: ${id}, Route: ${dishId}`,
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

function create(req, res) {
  const { data: { id, name, description, price, image_url } = {} } = req.body;
  const newDish = {
    id: nextId(),
    name,
    description,
    price,
    image_url,
  };
  dishes.push(newDish);
  res.status(201).json({ data: newDish });
}

function read(req, res, next) {
  const { dishId } = req.params;
  const foundDish = dishes.find(({ id }) => id === dishId);
  if (foundDish) {
    res.json({ data: foundDish });
  } else
    next({
      status: 404,
      message: `${dishId} not found`,
    });
}

function update(req, res, next) {
  const { foundDish } = res.locals;
  const { data: { id, name, description, price, image_url } = {} } = req.body;
  if (foundDish) {
    foundDish.id = id;
    foundDish.name = name;
    foundDish.description = description;
    foundDish.price = price;
    foundDish.image_url = image_url;
    res.json({ data: foundDish });
  } else {
    next({
      status: 404,
      message: `Dish does not exist: ${dishId}`,
    });
  }
}

module.exports = {
  create: [
    dataExists("name"),
    dataExists("description"),
    priceIsValid,
    dataExists("price"),
    dataExists("image_url"),
    create,
  ],
  read,
  list,
  update: [
    dishExists,
    fakeId,
    dataExists("name"),
    dataExists("description"),
    priceIsValid,
    dataExists("price"),
    dataExists("image_url"),
    update,
  ],
};
