const express=require("express");
const bodyParser=require("body-parser");
const mongoose=require("mongoose");
const app=express();
const _=require("loadash");

app.set('view engine','ejs');
app.use(bodyParser.urlencoded({extended:true}));
app.use(express.static('public'));
mongoose.connect("mongodb://0.0.0.0:27017/todolistDB",{useNewUrlParser:true});

const itemsSchema={
  name: String
};
// Mongoose Model
const Item=mongoose.model("Item",itemsSchema);
const item1=new Item({
 name:"Welcome to your TodoList!"
});
 const item2=new Item({
  name:"Hit the + button to add new item."
 })
 const item3=new Item({
  name:"<-- Hit this to delete an Item."
 });

const defaultItems=[item1,item2,item3];

const listSchema={
name:String,
items: [itemsSchema]
};

const List=mongoose.model("List",listSchema);


app.get("/",function(req,res){
   
  Item.find({},function(err,foundItems){
    //  console.log(foundItems);
    if(foundItems.length==0)
    {

Item.insertMany(defaultItems,function(err){
 if(err)
 {
  console.log(err);  
 }
 else
 {
  console.log("Successfully saved defaults items to DB.");
 }

});
res.redirect("/");
    }
    else
    {
     res.render("list",{listTitle: "Today",newListItem:foundItems});
    }
});
  
}); 

app.get("/:customListName",function(req,res){
 const customListName=_.capitalize(req.params.customListName);

 List.findOne({name:customListName},function(err,foundList){
  if(!err)
  {
    if(!foundList)
    {
      // Create a new List 
      const list=new List({
        name:customListName,
        items:defaultItems
      });  
      list.save();
      res.redirect("/" + customListName);
      // console.log("Doesn't exist");
    }
    else
    {
      // Show an existing list 
      res.render("list",{listTitle:foundList.name,newListItem:foundList.items});
      // console.log("Exists!");
    }
  }
 });


})

app.post("/",function(req,res){
    const itemName=req.body.newItem;
    const listName=req.body.list; 
    const item=new Item({
      name:itemName
    });

    if(listName=="Today")
    {
      item.save();
      res.redirect("/");
    }
    else
    {
      List.findOne({name:listName},function(err,foundList){
        foundList.items.push(item);
        foundList.save();
        res.redirect("/" + listName);
      });
    }
 

//  console.log(item); 

});

app.post("/delete",function(req,res){
  const checkedItemId=req.body.checkbox;
  const listName=req.body.listName;
  
  if(listName=="Today")
  {
    Item.findByIdAndRemove(checkedItemId,function(err){
      if(!err)
      {
        console.log("Successfully deleted checked item.");
        res.redirect("/");
      }
    });
  }
  else
  {
    List.findOneAndUpdate({name:listName},{$pull:{items:{_id:checkedItemId}}},function(err,foundList){
      if(!err)
      {
        res.redirect("/"+listName);
      }
    });
  }



});

app.get("/work",function(req,res){
    res.render("list",{listTitle:"Work List",newListItem:workItems});
});

app.get("/about",function(req,res){
    res.render("about");
});


app.post("/work",function(req,res){
  let item= req.body.newItem;
  workItems.push(item); 
  res.redirect("/work");
});

app.listen(3000,function(){
    console.log("Server started on port 3000.");
})