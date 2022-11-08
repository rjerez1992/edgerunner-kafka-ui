
<img src="https://raw.githubusercontent.com/rjerez1992/edgerunner-kafka-ui/master/imgs/logo.png" width=10% height=10%>

# Edgerunner - Kafka Consumer/Producer UI

Edgerunner is a very basic UI for consuming and producing JSON data to Kafka clusters. Keep in mind
this is not a cluster management tool and it was only made for its very specific purpose.

## State    

⚠️ This is in "alpha" state. It has multiple bugs and things to fix. If you plan to use it for production, please wait for a final release.
Since this is an "alpha" release, development tools are also enabled and some sensitive information might be logged on the console.

## Features

- Manage connections for multiple clusters. 
- Password storage using system's keychain.
- Connect to local clusters without security and remote clusters using SSL/SASL.
- Protect clusters from production with "Read-only" mode.
- Manage a collection of template messages for production.
- Rich editor for JSON messages. (Monaco)
- Create new topics.
- Subscribe to topics and consume messages.
- Produce to topics from templates or raw message.
- Data generation for template messages. (FakerJS)

## Upcoming

- Import/export templates and collection.
- Test connection on add/edit cluster data.
- Template versioning and groups.

## Limitations

- Credentials with cluster Admin access are required to fetch topic's list.


## Screenshots

![cluster-list-ss](https://raw.githubusercontent.com/rjerez1992/edgerunner-kafka-ui/master/imgs/ss1.png?raw=true)
![explorer-ss](https://github.com/rjerez1992/edgerunner-kafka-ui/blob/master/imgs/ss2.png?raw=true)
![message-editor-ss](https://github.com/rjerez1992/edgerunner-kafka-ui/blob/master/imgs/ss3.png?raw=true)
![add-cluster-ss](https://github.com/rjerez1992/edgerunner-kafka-ui/blob/master/imgs/ss4.png?raw=true)

## Tech Stack

- Main: ElectronJS + Angular (Typescript)
- Main Libraries: Monaco Editor, FakerJS, KafkaJS, SweetAlert2.

## Requests

Baside upcoming features, there isn't anything else planned. If you require
something like a new connection protocol or another message type (XML for example), 
please open an issue and I'll what I can do.

## Contributing

Contributions are always welcome. Don't hesistate to open a PR.
(Specially code refactoring because ngl it's a mess 😄)



## License

[MIT](https://choosealicense.com/licenses/mit/)
