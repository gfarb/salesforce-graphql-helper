import * as util from "util";
import fetch from "node-fetch";

class GraphQlSalesforceObject {
  constructor(apiName) {
    this.apiName = apiName;
    this.fields = [];
  }

  addFields(apiNames) {
    for (const field of apiNames) {
      this.addField(field);
    }
    return this;
  }

  addField(apiName) {
    this.fields.push(
      apiName.toLowerCase() === "id" ? "Id" : `${apiName} { value }`
    );
    return this;
  }

  addParentSObject(parentObject) {
    this.fields.push(
      `${parentObject.apiName} {
            ${parentObject.fields.toString()}
        }`
    );
    return this;
  }
}

export class RootSObject extends GraphQlSalesforceObject {
  constructor(apiName) {
    super(apiName);
  }
  filter;
  orderBy;

  addFilter(filter) {
    this.filter = filter;
    return this;
  }

  setOrder(field, order) {
    this.orderBy = {
      field: field,
      order: order
    };
    return this;
  }

  addChildSObject(parentObject) {
    this.fields.push(
      `${parentObject.apiName} {
        edges {
          node{
            ${parentObject.fields.toString()}
          }
        }
      }`
    );
    return this;
  }
}

export class ParentSObject extends GraphQlSalesforceObject {
  constructor(apiName) {
    super(apiName);
  }
}

export class ChildSObject extends GraphQlSalesforceObject {
  constructor(apiName) {
    super(apiName);
  }
}

export class GraphQlHelper {
  constructor(rootSObject) {
    this.sobjects = [];
    if (rootSObject !== undefined) this.addRootObject(rootSObject);
  }
  sobjects;

  addRootObject(sobject) {
    const topLevelForRootObject =
      sobject.filter === undefined && sobject.orderBy === undefined
        ? sobject.apiName
        : `${sobject.apiName}
        (
          ${
            sobject.filter !== undefined
              ? `where: ${util.inspect(sobject.filter).replace(/'/g, '"')}`
              : ""
          }
          ${
            sobject.orderBy !== undefined
              ? `orderBy: { ${sobject.orderBy.field}: { order: ${sobject.orderBy.order} } }`
              : ""
          }
        )`;
    const sobjectQuery = `
      ${topLevelForRootObject} {
        edges {
          node{
            ${sobject.fields.toString()}
          }
          cursor
        }
        pageInfo {
            hasNextPage
            hasPreviousPage
            startCursor
            endCursor
        }
      }`;
    this.sobjects.push(sobjectQuery);
  }

  async query() {
    const recordQuery = `
    query {
      uiapi {
        query {
          ${this.sobjects.toString()}
        }   
      }
    }
    `;
    return await query(recordQuery);
  }
}

export async function query(query, suppliedVariables) {
  const variables = suppliedVariables === null ? {} : suppliedVariables;
  const queryPayload = JSON.stringify({
    query: query,
    variables: { where: variables }
  });
  var requestOptions = {
    method: "POST",
    headers: {
      "X-Chatter-Entity-Encoding": "false",
      "Content-Type": "application/json",
      Authorization: `Bearer ${process.env.SALESFORCE_ACCESS_TOKEN}`
    },
    body: queryPayload,
    redirect: "follow"
  };

  const res = await fetch(
    `${process.env.SALESFORCE_API_URL}/graphql`,
    requestOptions
  );
  return await res.json();
}
