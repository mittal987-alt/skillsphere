import Gig from "../models/Gig.js";
import Freelancer from "../models/Freelancer.js";
export const searchFreelancers=async(req,res)=>{

try{

const{

keyword,
skill,
rating,
experience,
verified,
availability,
page=1,
limit=10

}=req.query;

const query={};

if(keyword){

query.title={
$regex:keyword,
$options:"i"
};

}

if(skill){

query.skills={$in:[skill]};

}

if(rating){

query.averageRating={
$gte:Number(rating)
};

}

if(experience){

query.experience={
$gte:Number(experience)
};

}

if(verified){

query.verified=verified==="true";

}

if(availability){

query.availability=availability;

}

const freelancers=await Freelancer.find(query)

.populate({
path:"user",
select:"name email"
})

.sort({
averageRating:-1
})

.skip((page-1)*limit)

.limit(Number(limit));

const total=await Freelancer.countDocuments(query);

res.json({

success:true,

page:Number(page),

total,

totalPages:Math.ceil(total/limit),

freelancers

});

}catch(error){

res.status(500).json({

success:false,

message:error.message

});

}

};

// ====================================
// Search Gigs
// ====================================

export const searchGigs = async (req,res)=>{

try{

const{

keyword,
category,
skill,
minBudget,
maxBudget,
experience,
status,
page=1,
limit=10,
sort="newest"

}=req.query;

const query={};

if(keyword){
  query.$or = [
    { title: { $regex: keyword, $options: "i" } },
    { description: { $regex: keyword, $options: "i" } }
  ];
}

if(category){
  query.category = category;
}

if(skill){
  // Handle if skill is a comma-separated list
  const skillsArray = skill.split(',').map(s => s.trim());
  query.skills = { $in: skillsArray };
}

if(experience){

query.experienceLevel=experience;

}

if(status){

query.status=status;

}

if(minBudget||maxBudget){

query.budget={};

if(minBudget)
query.budget.$gte=Number(minBudget);

if(maxBudget)
query.budget.$lte=Number(maxBudget);

}

let gigs=Gig.find(query)
.populate({
path:"client",
populate:{
path:"user",
select:"name"
}
});

switch(sort){

case "budgetLow":

gigs=gigs.sort({budget:1});

break;

case "budgetHigh":

gigs=gigs.sort({budget:-1});

break;

default:

gigs=gigs.sort({createdAt:-1});

}

const results=await gigs
.skip((page-1)*limit)
.limit(Number(limit));

const total=await Gig.countDocuments(query);

res.json({

success:true,

page:Number(page),

totalPages:Math.ceil(total/limit),

total,

results

});

}catch(error){

res.status(500).json({

success:false,

message:error.message

});

}

};