import React, { useEffect, useRef } from "react";
import "./newsfeed.scss";
import Stories from "../../components/stories/Stories";
import Posts from "../../components/posts/Posts";

export default function Newsfeed() {
  return (
    <div className="newsfeed">
      <Posts />
    </div>
  );
}
