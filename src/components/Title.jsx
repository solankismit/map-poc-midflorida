import React from "react";

const element = document.getElementById("branch-locator");
const FindABranchTitle = () => {
  const attrData = {
    title: element?.getAttribute("data-title"),
    description: element?.getAttribute("data-description"),
  };
  return (
    <div className="title-container">
      <div className="container">
        <h2 className="title">{attrData?.title}</h2>
        <p className="description l-body">{attrData?.description}</p>
      </div>
    </div>
  );
};

export default FindABranchTitle;
