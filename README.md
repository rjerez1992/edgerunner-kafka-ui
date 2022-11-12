
<img src="https://raw.githubusercontent.com/rjerez1992/edgerunner-kafka-ui/master/imgs/logo.png" width=10% height=10%>

# Edgerunner - Apache Kafka UI Consumer/Producer

Edgerunner is a basic Apache Kafka UI tool for consuming and producing JSON data to Kafka clusters. Keep in mind
this is not a cluster management tool and it was only made for its very specific purpose.

## State    

This is in **beta** stage. Most of the features have been already manually tested but there are some connectivity bugs that might happen from time to time. If you prefer, you can wait for a final release before using this on production environments. __(Check limitations and bugs for more information)__

## Features

- Manage connections for multiple clusters. 
- Password storage using system's keychain.
- Connect to local clusters without security and remote clusters using SSL/SASL.
- Protect clusters from production with "Read-only" mode.
- Manage a collection of template messages for production
- Export and import your message templates.
- Rich editor for JSON messages. (Monaco)
- Create new topics.
- Subscribe to topics and consume messages.
- Produce to topics from templates or raw message.
- Data generation for template messages. (FakerJS)

## Upcoming

- Test connection on add/edit cluster data.
- Template versioning and groups.

## Limitations and bugs

- Credentials with cluster Admin access are required to fetch topic's list.
- Cluster sessions might close when suspending the device.
- Some connection errors might not be properly handled.

## Screenshots

![cluster-list-ss](https://raw.githubusercontent.com/rjerez1992/edgerunner-kafka-ui/master/imgs/ss1.png?raw=true)
![explorer-ss](https://github.com/rjerez1992/edgerunner-kafka-ui/blob/master/imgs/ss2.png?raw=true)
![message-editor-ss](https://github.com/rjerez1992/edgerunner-kafka-ui/blob/master/imgs/ss3.png?raw=true)
![add-cluster-ss](https://github.com/rjerez1992/edgerunner-kafka-ui/blob/master/imgs/ss4.png?raw=true)

## Tech Stack

- Main: ElectronJS + Angular (Typescript)
- Main Libraries: Monaco Editor, FakerJS, KafkaJS, SweetAlert2.

## Requests

Beside upcoming features, there isn't anything else planned. If you require
something like a new connection protocol or another message type (XML for example), 
please open an issue and I'll see what I can do.

## Contributing

Contributions are always welcome. Don't hesistate to open a PR.
(Specially code refactoring because ngl it's a mess 😄)

## License

[MIT](https://choosealicense.com/licenses/mit/)
