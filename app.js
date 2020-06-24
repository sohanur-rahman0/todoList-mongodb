//jshint esversion:6

const express = require("express");
const bodyParser = require("body-parser");
const mongoose = require("mongoose");
const _ = require("lodash");
const date = require(__dirname + "/date.js");

const app = express();

app.set('view engine', 'ejs');

app.use(bodyParser.urlencoded({ extended: true }));
app.use(express.static("public"));

mongoose.connect("mongodb://localhost:27017/todolistDB", { useNewUrlParser: true, useUnifiedTopology: true });


const itemsScema = {
  name: String
};


const Item = mongoose.model("Item", itemsScema);


const item1 = new Item(
  { name: "Welcome to your todo List" }
)

const item2 = new Item(
  { name: "Hit the + button to add new Item" }
)

const item3 = new Item(
  { name: "Default item 3" }
)


defaultItem = [item1, item2, item3];


const listSchema = {
  name: String,
  items: [itemsScema]
}


const List = mongoose.model("List", listSchema);




app.get("/", function (req, res) {

  //const day = date.getDate();

  Item.find({}, function (err, foundItems) {
    if (foundItems.length === 0) {
      Item.insertMany(defaultItem, (err) => {
        if (err) {
          console.log(err);
        } else {
          console.log("Updated default item");
        }
      });
      res.redirect("/");
    } else {
      res.render("list", { listTitle: "Today", newListItems: foundItems });
    }

  });

});

app.post("/", function (req, res) {

  const itemName = req.body.newItem;
  const listName = req.body.list;

  const item = new Item(
    { name: itemName }
  )
  

  if (listName === "Today") {
    item.save();
    res.redirect("/");
  }else{
    List.findOne({ name: listName } , (err, foundList)=>{
      // console.log(foundList.items);
      
      foundList.items.push(item);
      foundList.save();
      res.redirect("/" + listName);
    })
  }



  // if (req.body.list === "Work") {
  //   workItems.push(item);
  //   res.redirect("/work");
  // } else {
  //   items.push(item);
  //   res.redirect("/");
  // }
});


app.post("/delete", (req, res) => {
  const checkedItem = req.body.checkbox;
  const listName = req.body.listName;


  if(listName === "Today"){
    Item.findByIdAndRemove(checkedItem, function (err) {
      if (err) {
        console.log(err);
      } else {
        res.redirect("/");
      }
    })

  }else{

      List.findOneAndUpdate({name: listName}, {$pull: {items: {_id: checkedItem}}}, (err, foundList)=>{
        if(!err){
          res.redirect("/" + listName);
        }
      })

  }

  
})

// app.get("/work", function(req,res){
//   res.render("list", {listTitle: "Work List", newListItems: workItems});
// });


app.get("/:customListname", (req, res) => {
  const customListname = _.capitalize(req.params.customListname);




  List.findOne({ name: customListname }, (err, foundList) => {

    if (!err) {
      if (!foundList) {
        //create new list
        console.log("New default items created");
        const list = new List(
          {
            name: customListname,
            items: defaultItem,
          }
        )

        list.save();
        res.redirect("/" + customListname);
      } else {
        //show existing list
        res.render("list", { listTitle: foundList.name, newListItems: foundList.items })
      }
    }
  })


});

app.get("/about", function (req, res) {
  res.render("about");
});

app.listen(8000, function () {
  console.log("Server started on port 8000");
});
