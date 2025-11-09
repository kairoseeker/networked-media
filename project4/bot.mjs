import dotenv from "dotenv"
import {createRestAPIClient} from "masto"

dotenv.config();

const masto = createRestAPIClient({
  url: "https://networked-media.itp.io/",
  accessToken: process.env.TOKEN,
});

let allPosts;
let counter = 0;
fetch("https://networked-media.inthecreat.ing/api/project4/")
  .then((response) => response.json())
  .then((data) => {
    allPosts = data.allPosts;
    makeStatus();
  });

async function makeStatus() {
  let post = allPosts[counter].content
  counter++;
  if (counter >= allPosts.length) {
    counter = 0;
  }
  const status = masto.v1.statuses.create({
    status: post,
    visibility: "public",
  });
}

setInterval(() => {
  makeStatus();
}, 3 * 60 * 60 * 1000);

//makeStatus()
