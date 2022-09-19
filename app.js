//jshint esversion:6

const express = require("express");
const bodyParser = require("body-parser");
const mongoose = require("mongoose");
const _ = require("lodash");

const app = express();

app.set('view engine', 'ejs');

app.use(bodyParser.urlencoded({extended: true}));
app.use(express.static("public"));

mongoose.connect("mongodb+srv://admin-uditesh:admin.uditesh@cluster0.5de5r.mongodb.net/todolistDB",{useNewUrlParser:true, useUnifiedTopology: true });

//Item Schema
const itemsSchema = {
  name: String
};
const Item = mongoose.model("Item",itemsSchema);
const Book = new Item({
  name : "Book"
});
const Study = new Item({
  name: "Study"
});
const Exercise = new Item({
  name: "Exercise"
});
const itemsArray = [Book,Study,Exercise];

//List Schema
const listSchema = {
  name: String,
  items: [itemsSchema]
};
const List = mongoose.model("List",listSchema);

app.get("/", function(req, res) {
  Item.find({},(err,foundItems)=>{
    if(foundItems.length === 0){
      Item.insertMany(itemsArray,(err)=>{
        if(err){
          console.log(err);
        }else{
          console.log("Successfully added!");
        }
      });
      res.redirect("/");
    }
    else{res.render("list", {listTitle: "Today", newListItems: foundItems});}
  });
});

app.get("/:customListName",(req,res)=>{
  const customListName = _.capitalize(req.params.customListName);
  List.findOne({name : customListName} , (err, foundList)=>{
    if(!err){
      if(!foundList){
        //create new list
        const list = new List({
          name: customListName,
          items: itemsArray
        });
        list.save();
        res.redirect("/"+customListName);
      }else{
        //show existing list
        res.render("list", {listTitle: foundList.name, newListItems: foundList.items});
      }
    }
  });

});

app.post("/", (req, res)=>{
  const itemName = req.body.newItem;
  const listName = req.body.list;

  const addedNewItem = new Item({
    name : itemName
  });
  if(listName === "Today"){
    addedNewItem.save();
    res.redirect("/");
  }else{
    List.findOne({name:listName},(err,foundList)=>{
      foundList.items.push(addedNewItem);
      foundList.save();
      res.redirect("/"+listName);
    });
  }
});

app.post("/delete",(req,res)=>{
  const selectedItemId = req.body.checkbox;
  const listName = req.body.listName;
  if(listName === "Today"){
    Item.findByIdAndRemove(selectedItemId,(err)=>{
      if(!err){
        console.log("Successfully deleted!");
        res.redirect("/");
      }
    });
  }else{
    List.findOneAndUpdate({name:listName}, {$pull:{items:{_id:selectedItemId}}},(err,foundList)=>{
      if(!err){
        res.redirect("/" +listName);
      }
    });
  }
});


app.get("/about", (req, res)=>{
  res.render("about");
});

let port = process.env.PORT;
if (port == null || port == "") {
  port = 3000;
}
app.listen(port, () => {
  console.log("Server has started Successfully.");
});
