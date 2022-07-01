# Salesforce GraphQL Helper

Salesforce GraphQL API client for browsers and Node with functionality to dynamically, quickly and easily create Salesforce GraphQL queries.

## Installation

Use the Node package manager [npm](https://www.npmjs.com/package/salesforce-graphql-helper) to install Salesforce GraphQL Helper.

```bash
npm install salesforce-graphql-helper
```

## Usage

### Required:

- Set an environment variable called `SALESFORCE_ACCESS_TOKEN` that stores a valid Salesforce access token that will be used for authentication.
- Set an environment variable called `SALESFORCE_API_URL` that stores your Salesforce API URL (e,g. `https://MyDomainName.my.salesforce.com/services/data/v55.0`).

### GraphQlHelper Class:

> Dynamically, quickly and easily create and invoke Salesforce GraphQL queries without worrying about syntax.

#### RootSObject:

_Query field values from root object_.

```javascript
import { GraphQlHelper, RootSObject } from "salesforce-graphql-helper";

(async function start() {
  const queryHelper = new GraphQlHelper(
    new RootSObject("Account").addField("Id").addField("Name")
  );
  const response = await queryHelper.query();
})();
```

_Query field values from multiple root objects_.

```javascript
import { GraphQlHelper, RootSObject } from "salesforce-graphql-helper";

(async function start() {
  const queryHelper = new GraphQlHelper();
  const account = new RootSObject("Account")
    .addField("Id")
    .addField("Name")
    .addFilter({ Name: { like: "Test%" } });
  queryHelper.addRootObject(account);
  queryHelper.addRootObject(
    new RootSObject("Contact").addField("Id").addField("Name")
  );
  const response = await queryHelper.query();
})();
```

#### ParentSObject:

_Query field values from root object as well as field values from parent objects_.

```javascript
import { GraphQlHelper, RootSObject, ParentSObject } from "salesforce-graphql-helper";

(async function start() {
  const queryHelper = new GraphQlHelper(
    new RootSObject("Contact")
      .addField("Id")
      .addField("Name")
      .addParentSObject(new ParentSObject("Account").addField("Name"))
  );
  const response = await queryHelper.query();
})();
```

#### ChildSObject:

_Query field values from root object as well as field values from child objects. Child relationships may only be requested as direct descendants of the root object type. You can't query fields from a child relationship pertaining to a parent of the root object_.

```javascript
import { GraphQlHelper, RootSObject, ChildSObject } from "salesforce-graphql-helper";

(async function start() {
  const queryHelper = new GraphQlHelper(
    new RootSObject("Account")
      .addField("Id")
      .addField("Name")
      .addChildSObject(new ChildSObject("Contacts").addField("Name"))
  );
  const response = await queryHelper.query();
})();
```

#### Filtering:

_Set the `where` argument and filter type value (see the `Filtering` section of the [GraphQL docs](https://developer.salesforce.com/blogs/2022/05/exploring-the-salesforce-graphql-api-part-two))_.

```javascript
import { GraphQlHelper, RootSObject } from "salesforce-graphql-helper";

(async function start() {
  const queryHelper = new GraphQlHelper(
    new RootSObject("Account")
      .addField("Id")
      .addField("Name")
      .addFilter({ Name: { like: "Test%" } })
  );
  const response = await queryHelper.query();
})();
```

#### Ordering:

_Set the `orderBy` argument and OrderBy type value (see the `Ordering` section of the [GraphQL docs](https://developer.salesforce.com/blogs/2022/05/exploring-the-salesforce-graphql-api-part-two))_.

```javascript
import { GraphQlHelper, RootSObject } from "salesforce-graphql-helper";

(async function start() {
  const queryHelper = new GraphQlHelper(
    new RootSObject("Account")
      .addField("Id")
      .addField("Name")
      .setOrder("Name", "ASC")
  );
  const response = await queryHelper.query();
})();
```

#### Putting it all together:

_Example portraying a combination `GraphQlHelper` functionality._

```javascript
import { GraphQlHelper, RootSObject, ParentSObject, ChildSObject } from "salesforce-graphql-helper";

(async function start() {
  const queryHelper = new GraphQlHelper(
    new RootSObject("Account")
      .addFields(["Id", "Name"])
      .addFilter({ Name: { like: "Test%" } })
      .setOrder("Name", "ASC")
      .addParentSObject(new ParentSObject("Parent").addField("Name"))
      .addChildSObject(
        new ChildSObject("Contacts")
          .addFields(["Id", "Name"])
          .addParentSObject(new ParentSObject("CreatedBy").addField("Name"))
      )
  );
  const response = await queryHelper.query();
})();
```

### Query Function:

> Invoke a Salesforce GraphQL query as a string and optionally pass filters as a variable.

```javascript
import { query } from "salesforce-graphql-helper";

(async function start() {
  const queryString = `
    query accounts {
      uiapi {
        query {
          Account {
            edges {
              node {
                Id
                Name {
                  value
                }
              }
            }
          }
        }
      }
    }
  `;

  const response = await query(queryString);
})();
```

```javascript
import { query } from "salesforce-graphql-helper";
(async function start() {
  const queryString = `
    query accountsWithFilter($where: Account_Filter) {
      uiapi {
        query {
          Account(where: $where) {
            edges {
              node {
                Id
                Name {
                  value
                }
              }
            }
          }
        }
      }
    }
  `;
  const accountNameFilter = { Name: { like: "Test%" } };
  const response = await query(queryString, accountNameFilter);
})();
```

## To do
- Add auto-pagination functionality

## License

This project is licensed under the GNU General Public License v3.0 - see the [LICENSE.md](LICENSE.md) file for details.

## Supporting Docs

- [Salesforce GraphQL](https://developer.salesforce.com/blogs/2022/05/exploring-the-salesforce-graphql-api-part-two)
- [Understanding Salesforce Relationship Names, Custom Objects, and Custom Fields](https://developer.salesforce.com/docs/atlas.en-us.soql_sosl.meta/soql_sosl/sforce_api_calls_soql_relationships_and_custom_objects.htm)