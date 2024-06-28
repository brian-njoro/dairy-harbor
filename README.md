The **get API link** was changed to `'api.add_resource(CattleResource, '/cattle/get')'` and **post to** `'api.add_resource(CattleResource, '/cattle/get')'`.

Please note the changes when using **Thunderclient**. This was done in order to create a **home link** which uses `cattle.html`, which is routed by the `'/cattle'` endpoint. This could have caused conflicts with the API resource for **get** and **post**.

**All have been resolved!!**

