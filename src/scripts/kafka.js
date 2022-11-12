const { Kafka, logLevel } = require('kafkajs')
const { safeStorage } = require("electron");

let activeCluster = undefined;
let activeConsumer = undefined;
let activeProducer = undefined;
let activeAdminClient = undefined;

let isConsumerSubscribed = false;

let activeClusterInformation = {};

let errorCallbackActiveConsumer;

let isConsumerPaused = false;
let activeTopic = "";

exports.connectCluster = async function (clusterInformation, securedPass, errorCallback) {
    if (activeCluster){
        console.error("KafkaJS: There is already an active cluster when trying connect to a new one");
        return false;
    }
    console.log("KafkaJS: Connecting to a Kafka cluster");
    console.log(clusterInformation);

    var pass = clusterInformation.plainPassword;
    if (securedPass != ""){
        pass = securedPass;
    }

    activeCluster =  new Kafka({
        //logLevel: logLevel.DEBUG,
        clientId: clusterInformation.clientName,
        brokers: [clusterInformation.host],
        connectionTimeout: 10 * 1000,
        requestTimeout: 30 * 1000,
        authenticationTimeout: 10 * 1000,
        reauthenticationThreshold: 10 * 1000,
        ssl: clusterInformation.secureMode == true,
        sasl: (clusterInformation.username && clusterInformation.username != "") ? 
        {
            mechanism: 'plain',
            username: clusterInformation.username,
            password: pass
        } : false
    });

    if (clusterInformation.secureMode == true){
        console.log("KafkaJS: SSL secure mode enabled");
    }

    if (clusterInformation.username && clusterInformation.username != ""){
        console.log("KafkaJS: Plain credentials enabled");
    }

    console.log("KafkaJS: Broker connection with values:");
    console.log(activeCluster);

    activeClusterInformation = clusterInformation;
    return await connectConsumer(clusterInformation.groupId, errorCallback);
}

exports.setupAdminClient = async function (disconnectCallback) {
    //
}

exports.setupProducerClient = async function (disconnectCallback) {
    //
}

exports.topicList = async function () {
    if (activeCluster == undefined){
        return [];
    }
    if (!activeAdminClient){
        activeAdminClient = activeCluster.admin();
        await activeAdminClient.connect();
    }
    return await activeAdminClient.listTopics();
}

exports.createTopic = async function (topicName) {
    console.error("KafkaJS: Trying to create topic with name "+topicName);
    if (activeCluster == undefined){
        return false;
    }
    if (!activeAdminClient){
        activeAdminClient = activeCluster.admin();
        await activeAdminClient.connect();
    }
    return await activeAdminClient.createTopics({
        topics: [{topic: topicName}]
    })
}

exports.subscribeToTopic = async function (targetTopic, messageCallback){
    if (!activeCluster || !activeConsumer){
        console.error("KafkaJS: Trying to subscribe to topic without cluster or consumer active");
        return false;
    }

    if (isConsumerSubscribed){
        await renewConsumer();
    }

    console.log("KafkaJS: Subscribing to topic "+ targetTopic);
    await activeConsumer.subscribe({ topics: [targetTopic] });
    isConsumerSubscribed = true;
    activeTopic = targetTopic;
    await activeConsumer.run({
        eachMessage: async ({ topic, partition, message, heartbeat, pause }) => {
            messageCallback(topic, message);
        },
    })
}

exports.publishToTopic = async function (targetTopic, key, message) {
    if (!activeCluster){
        console.error("KafkaJS: Trying to publish without active cluster");
        return false;
    }
    if (!activeProducer){
        console.log("KafkaJS: Initializing producer");
        activeProducer = activeCluster.producer();
        await activeProducer.connect()
    }
    await activeProducer.send({
        topic: targetTopic,
        messages: [
            { key: key, value: message }
        ],
    })
    return true;
}

exports.pauseConsumer = async function () {
    if (activeConsumer && !isConsumerPaused && isConsumerSubscribed){
        console.log("KafkaJS: Pausing consumer for topic "+activeTopic);
        isConsumerPaused = true;
        activeConsumer.pause([{ topic: activeTopic }]);
    }
}

exports.resumeConsumer = async function () {
    if (activeConsumer && isConsumerPaused && isConsumerSubscribed){
        console.log("KafkaJS: Resuming consumer for topic "+activeTopic);
        isConsumerPaused = false;
        activeConsumer.resume([{ topic: activeTopic }]);
    }
}

exports.kafkaCleanup = async function () {
    console.warn("KafkaJS: Cleaning up connection on request");
    if (activeConsumer){
        await activeConsumer.disconnect();
        activeConsumer = undefined;
    }
    if (activeAdminClient){
        await activeAdminClient.disconnect();
        activeAdminClient = undefined;
    }
    if (activeProducer){
        await activeProducer.disconnect();
        activeProducer = undefined;
    }
    activeCluster = undefined;

    console.warn("KafkaJS: Cleaning up variables");
    isConsumerSubscribed = false;
    activeClusterInformation = {};
    errorCallbackActiveConsumer;
    isConsumerPaused = false;

    console.warn("KafkaJS: Connections cleaned up");
}

connectConsumer = async (groupId, errorCallback) => {
    console.log("KafkaJS: Connecting Kafka consumer using group: "+groupId);
    activeConsumer = activeCluster.consumer({ groupId: groupId });

    const { DISCONNECT, CRASH } = activeConsumer.events;
    activeConsumer.on(DISCONNECT, e => errorCallback("DISCONNECT"));
    activeConsumer.on(CRASH, e => errorCallback("CRASH"));

    errorCallbackActiveConsumer = errorCallback;

    await activeConsumer.connect();
    return true;
}

renewConsumer = async () => {
    console.log("KafkaJS: Renewing consumer");
    const { DISCONNECT, CRASH } = activeConsumer.events;

    //NOTE: Reset variables
    isConsumerSubscribed = false;
    isConsumerPaused = false;
    activeTopic = "";

    activeConsumer.on(DISCONNECT, e => console.log("KafkaJS: Old active disconnected"));
    activeConsumer.on(CRASH, e => console.log("KafkaJS: Old active crashed"));

    console.log("KafkaJS: Disconnecting old consumer");
    await activeConsumer.disconnect();
        
    console.log("KafkaJS: Connecting renewed consumer with groupId: "+ activeClusterInformation.groupId);
    activeConsumer = activeCluster.consumer({ groupId: activeClusterInformation.groupId });

    activeConsumer.on(DISCONNECT, e => errorCallbackActiveConsumer("DISCONNECT"));
    activeConsumer.on(CRASH, e => errorCallbackActiveConsumer("CRASH"));

    await activeConsumer.connect();
    return true;
}

const signalTraps = ['SIGTERM', 'SIGINT', 'SIGUSR2']
signalTraps.forEach(type => {
    process.once(type, async () => {
        try {
            await kafkaCleanup();
        } finally {
            process.kill(process.pid, type);
        }
    })
})