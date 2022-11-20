
<img src="https://raw.githubusercontent.com/rjerez1992/edgerunner-kafka-ui/master/imgs/logo.png" width=10% height=10%>

# Edgerunner - Apache Kafka UI Consumer/Producer

Edgerunner is a basic Apache Kafka UI tool for consuming and producing JSON data to Kafka clusters. Keep in mind
this is not a cluster management tool and it was only made for its very specific purpose.

:warning: __This is in beta stage. Some bugs might happen. I recommend to wait for a stable release before using on production environment.__

## How to run    

Download the appropiate **.zip** file from the [releases page](https://github.com/rjerez1992/edgerunner-kafka-ui/releases), unzip and run.

## How to use

I hope it is simple enought but if you have any question then check this [quick youtube guide](https://www.youtube.com/watch?v=XPp1sDUerVw).

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

- Template versioning and groups.
- Automated message production over time.
- User data pools for generators.
- Templates search and filters.
- Export/import connections.

## Limitations and bugs

- Credentials with cluster's topics access are required to fetch topics list.
- Cluster sessions might close when suspending the device and/or losing connection.
- Some connection errors might not be properly handled and cause UI to break.

## Previews

### Connections management

![](https://github.com/rjerez1992/edgerunner-kafka-ui/blob/master/imgs/preview_connections.gif)

### Topics management

![](https://github.com/rjerez1992/edgerunner-kafka-ui/blob/master/imgs/preview_topics.gif)

### Templates and production

![](https://github.com/rjerez1992/edgerunner-kafka-ui/blob/master/imgs/preview_templates.gif)

### Templates import/export

![](https://github.com/rjerez1992/edgerunner-kafka-ui/blob/master/imgs/preview_import_export.gif)

### Data generators

![](https://github.com/rjerez1992/edgerunner-kafka-ui/blob/master/imgs/preview_generators.gif)

## Tech Stack

- Main: ElectronJS + Angular (Typescript)
- Main Libraries: Monaco Editor, FakerJS, KafkaJS, SweetAlert2.

## Requests

Beside upcoming features, there isn't anything else planned. If you require
something like a new connection protocol or another message type (XML for example), 
please open an issue and I'll see what I can do.

## Contributing

Contributions are always welcome. Don't hesistate to open a PR.
(Specially code refactoring because ngl it's not properly distributed on components)

## License

[MIT](https://choosealicense.com/licenses/mit/)
