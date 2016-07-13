define({ "api": [
  {
    "success": {
      "fields": {
        "Success 200": [
          {
            "group": "Success 200",
            "optional": false,
            "field": "varname1",
            "description": "<p>No type.</p>"
          },
          {
            "group": "Success 200",
            "type": "String",
            "optional": false,
            "field": "varname2",
            "description": "<p>With type.</p>"
          }
        ]
      }
    },
    "type": "",
    "url": "",
    "version": "0.0.0",
    "filename": "./doc/main.js",
    "group": "C__Users_Akbar_Documents_Workspace_Website_vhosts_PetaKami_V2_PKBackend_doc_main_js",
    "groupTitle": "C__Users_Akbar_Documents_Workspace_Website_vhosts_PetaKami_V2_PKBackend_doc_main_js",
    "name": ""
  },
  {
    "type": "get",
    "url": "/user/me",
    "title": "Request User information",
    "header": {
      "fields": {
        "Header": [
          {
            "group": "Header",
            "type": "String",
            "optional": false,
            "field": "authorization",
            "description": "<p>User Token.</p>"
          },
          {
            "group": "Header",
            "type": "Application/Json",
            "optional": false,
            "field": "content-type",
            "description": "<p>Allowed Media-Type.</p>"
          }
        ]
      }
    },
    "version": "0.1.0",
    "name": "GetUser",
    "group": "User",
    "success": {
      "fields": {
        "Success 200": [
          {
            "group": "Success 200",
            "type": "Int",
            "optional": false,
            "field": "id",
            "description": "<p>The User Id.</p>"
          },
          {
            "group": "Success 200",
            "type": "String",
            "optional": false,
            "field": "full_name",
            "description": "<p>Fullname of the User.</p>"
          }
        ]
      },
      "examples": [
        {
          "title": "Success-Response:",
          "content": " HTTP/1.1 200 OK\n {\n   \"id\": 1,\n   \"full_name\": \"Hello World\"\n}",
          "type": "json"
        }
      ]
    },
    "filename": "./app/controllers/UserController.js",
    "groupTitle": "User"
  },
  {
    "type": "post",
    "url": "/user/register",
    "title": "Register new user",
    "header": {
      "fields": {
        "Header": [
          {
            "group": "Header",
            "type": "Application/Json",
            "optional": false,
            "field": "content-type",
            "description": "<p>Allowed Media-Type.</p>"
          }
        ]
      }
    },
    "version": "0.1.0",
    "name": "RegisterUser",
    "group": "User",
    "parameter": {
      "examples": [
        {
          "title": "Request-Example:",
          "content": "{\n  \"email\": \"demo@petakami.com\",\n  \"password\": \"demo123\",\n  \"full_name\": \"demo peta kami\"\n}",
          "type": "json"
        }
      ]
    },
    "success": {
      "fields": {
        "Boolean": [
          {
            "group": "Boolean",
            "optional": false,
            "field": "error",
            "description": "<p>Error Status</p>"
          }
        ]
      },
      "examples": [
        {
          "title": "Success-Response:",
          "content": " HTTP/1.1 200 OK\n {\n   \"data\": {\n      \"error\" : false\n   }\n}",
          "type": "json"
        }
      ]
    },
    "filename": "./app/controllers/UserController.js",
    "groupTitle": "User"
  },
  {
    "type": "get",
    "url": "/user/active/:hash",
    "title": "Actived user status",
    "header": {
      "fields": {
        "Header": [
          {
            "group": "Header",
            "type": "Application/Json",
            "optional": false,
            "field": "content-type",
            "description": "<p>Allowed Media-Type.</p>"
          }
        ]
      }
    },
    "version": "0.1.0",
    "name": "SetUserToActive",
    "group": "User",
    "parameter": {
      "fields": {
        "Parameter": [
          {
            "group": "Parameter",
            "type": "Hash",
            "optional": false,
            "field": "hash",
            "description": "<p>User unique Hash from Email</p>"
          }
        ]
      }
    },
    "success": {
      "fields": {
        "Boolean": [
          {
            "group": "Boolean",
            "optional": false,
            "field": "error",
            "description": "<p>Error Status</p>"
          }
        ]
      },
      "examples": [
        {
          "title": "Success-Response:",
          "content": " HTTP/1.1 200 OK\n {\n   \"data\": {\n      \"error\" : false\n   }\n}",
          "type": "json"
        }
      ]
    },
    "filename": "./app/controllers/UserController.js",
    "groupTitle": "User"
  },
  {
    "type": "post",
    "url": "/user/authenticate",
    "title": "Request User Token",
    "header": {
      "fields": {
        "Header": [
          {
            "group": "Header",
            "type": "Application/Json",
            "optional": false,
            "field": "content-type",
            "description": "<p>Allowed Media-Type.</p>"
          }
        ]
      }
    },
    "version": "0.1.0",
    "name": "UserAuthenticate",
    "group": "User",
    "parameter": {
      "examples": [
        {
          "title": "Request-Example:",
          "content": "{\n    \"email\": \"demo@petakami.com\",\n    \"password\": \"demo123\"\n}",
          "type": "json"
        }
      ]
    },
    "success": {
      "fields": {
        "Success 200": [
          {
            "group": "Success 200",
            "type": "JWT",
            "optional": false,
            "field": "token",
            "description": "<p>User Token</p>"
          }
        ]
      },
      "examples": [
        {
          "title": "Success-Response:",
          "content": "HTTP/1.1 200 OK\n    {\n      \"success\": true,\n      \"token\" : \"eyJ0eXAiOiJKV1QiLCJhbGciOiJIUzI1NiJ9.eyJpc3MiOiJ1c2VybmFtZSIsInN1YiI6IjEiLCJpYXQiOjE0NTc0MzYxNjAsImV4cCI6MjkxNTQ3NzEyMH0.aP1gr5brZklNM4OzuMFDRphXXLWauZ7kbcxLS_ESItM\"\n   }",
          "type": "json"
        }
      ]
    },
    "filename": "./app/controllers/UserController.js",
    "groupTitle": "User"
  },
  {
    "type": "get",
    "url": "/workspace/:workspace/draw",
    "title": "DrawType of workspace",
    "header": {
      "fields": {
        "Header": [
          {
            "group": "Header",
            "type": "String",
            "optional": false,
            "field": "authorization",
            "description": "<p>User Token.</p>"
          },
          {
            "group": "Header",
            "type": "Application/Json",
            "optional": false,
            "field": "content-type",
            "description": "<p>Allowed Media-Type.</p>"
          }
        ]
      }
    },
    "version": "0.1.0",
    "name": "GetDrawTypeOfWorkspace",
    "group": "Workspace",
    "parameter": {
      "fields": {
        "Parameter": [
          {
            "group": "Parameter",
            "type": "String",
            "optional": false,
            "field": "workspace",
            "description": "<p>Specific workspace of PetaKami (IDBangunan, IDTransportasi, IDHipsografi, IDBatasDaerah, IDTutupanLahan, IDHydrografi, IDToponomi)</p>"
          }
        ]
      }
    },
    "success": {
      "fields": {
        "Array": [
          {
            "group": "Array",
            "optional": false,
            "field": "drawType",
            "description": "<p>Potential DrawType</p>"
          }
        ]
      },
      "examples": [
        {
          "title": "Success-Response:",
          "content": " HTTP/1.1 200 OK\n {\n   ['Point', 'LineString', 'Polygon']\n}",
          "type": "json"
        }
      ]
    },
    "filename": "./app/controllers/WorkspaceController.js",
    "groupTitle": "Workspace"
  },
  {
    "type": "get",
    "url": "/workspace/all",
    "title": "Get the workspace list",
    "header": {
      "fields": {
        "Header": [
          {
            "group": "Header",
            "type": "String",
            "optional": false,
            "field": "authorization",
            "description": "<p>User Token.</p>"
          },
          {
            "group": "Header",
            "type": "Application/Json",
            "optional": false,
            "field": "content-type",
            "description": "<p>Allowed Media-Type.</p>"
          }
        ]
      }
    },
    "version": "0.1.0",
    "name": "GetWorkspaceList",
    "group": "Workspace",
    "success": {
      "fields": {
        "Array": [
          {
            "group": "Array",
            "optional": false,
            "field": "workspaces",
            "description": "<p>Workspace Collection</p>"
          }
        ]
      },
      "examples": [
        {
          "title": "Success-Response:",
          "content": " HTTP/1.1 200 OK\n {\n   ['IDBangunan', 'IDTransportasi', 'IDHipsografi', 'IDBatasDaerah', 'IDTutupanLahan', 'IDHydrografi', 'IDToponomi']\n}",
          "type": "json"
        }
      ]
    },
    "filename": "./app/controllers/WorkspaceController.js",
    "groupTitle": "Workspace"
  }
] });
