import React from "react";
import { Route, Switch } from "react-router-dom";
import { TemplateBuilder } from "./TemplateBuilder/TemplateBuilder";
import { TemplateDetails } from "./TemplateDetails/TemplateDetails";

export function Views() {
  return (
    <Switch>
      <Route path="/template/:chainId/:token/:id" component={TemplateDetails} />
      <Route path="/type/:type" component={TemplateBuilder} />
      <Route path="/" component={TemplateBuilder} />
    </Switch>
  );
}
