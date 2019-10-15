/*
 * Copyright 2018-2019 Amazon.com, Inc. or its affiliates. All Rights Reserved.
 * Licensed under the Apache License, Version 2.0 (the "License").
 * You may not use this file except in compliance with the License.
 * A copy of the License is located at
 *      http://www.apache.org/licenses/LICENSE-2.0
 *
 * or in the "license" file accompanying this file. This file is distributed
 * on an "AS IS" BASIS, WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either
 * express or implied. See the License for the specific language governing
 * permissions and limitations under the License.
 */

//
// Alexa Fact Skill - Sample for Beginners
//

// sets up dependencies
const Alexa = require('ask-sdk-core');
const i18n = require('i18next');

// core functionality for fact skill
const GetNewFactHandler = {
  canHandle(handlerInput) {
    const request = handlerInput.requestEnvelope.request;
    // checks request type
    return request.type === 'LaunchRequest'
      || (request.type === 'IntentRequest'
        && request.intent.name === 'GetNewFactIntent');
  },
  handle(handlerInput) {
    const requestAttributes = handlerInput.attributesManager.getRequestAttributes();
    // gets a random fact by assigning an array to the variable
    // the random item from the array will be selected by the i18next library
    // the i18next library is set up in the Request Interceptor
    const randomFact = requestAttributes.t('FACTS');
    // concatenates a standard message with the random fact
    const speakOutput = requestAttributes.t('GET_FACT_MESSAGE') + randomFact;

    return handlerInput.responseBuilder
      .speak(speakOutput)
      // Uncomment the next line if you want to keep the session open so you can
      // ask for another fact without first re-opening the skill
      // .reprompt(requestAttributes.t('HELP_REPROMPT'))
      .withSimpleCard(requestAttributes.t('SKILL_NAME'), randomFact)
      .getResponse();
  },
};

const HelpHandler = {
  canHandle(handlerInput) {
    const request = handlerInput.requestEnvelope.request;
    return request.type === 'IntentRequest'
      && request.intent.name === 'AMAZON.HelpIntent';
  },
  handle(handlerInput) {
    const requestAttributes = handlerInput.attributesManager.getRequestAttributes();
    return handlerInput.responseBuilder
      .speak(requestAttributes.t('HELP_MESSAGE'))
      .reprompt(requestAttributes.t('HELP_REPROMPT'))
      .getResponse();
  },
};

const FallbackHandler = {
  // The FallbackIntent can only be sent in those locales which support it,
  // so this handler will always be skipped in locales where it is not supported.
  canHandle(handlerInput) {
    const request = handlerInput.requestEnvelope.request;
    return request.type === 'IntentRequest'
      && request.intent.name === 'AMAZON.FallbackIntent';
  },
  handle(handlerInput) {
    const requestAttributes = handlerInput.attributesManager.getRequestAttributes();
    return handlerInput.responseBuilder
      .speak(requestAttributes.t('FALLBACK_MESSAGE'))
      .reprompt(requestAttributes.t('FALLBACK_REPROMPT'))
      .getResponse();
  },
};

const ExitHandler = {
  canHandle(handlerInput) {
    const request = handlerInput.requestEnvelope.request;
    return request.type === 'IntentRequest'
      && (request.intent.name === 'AMAZON.CancelIntent'
        || request.intent.name === 'AMAZON.StopIntent');
  },
  handle(handlerInput) {
    const requestAttributes = handlerInput.attributesManager.getRequestAttributes();
    return handlerInput.responseBuilder
      .speak(requestAttributes.t('STOP_MESSAGE'))
      .getResponse();
  },
};

const SessionEndedRequestHandler = {
  canHandle(handlerInput) {
    const request = handlerInput.requestEnvelope.request;
    return request.type === 'SessionEndedRequest';
  },
  handle(handlerInput) {
    console.log(`Session ended with reason: ${handlerInput.requestEnvelope.request.reason}`);
    return handlerInput.responseBuilder.getResponse();
  },
};

const ErrorHandler = {
  canHandle() {
    return true;
  },
  handle(handlerInput, error) {
    console.log(`Error handled: ${error.message}`);
    console.log(`Error stack: ${error.stack}`);
    const requestAttributes = handlerInput.attributesManager.getRequestAttributes();
    return handlerInput.responseBuilder
      .speak(requestAttributes.t('ERROR_MESSAGE'))
      .reprompt(requestAttributes.t('ERROR_MESSAGE'))
      .getResponse();
  },
};

const LocalizationInterceptor = {
  process(handlerInput) {
    // Gets the locale from the request and initializes i18next.
    const localizationClient = i18n.init({
      lng: handlerInput.requestEnvelope.request.locale,
      resources: languageStrings,
      returnObjects: true
    });
    // Creates a localize function to support arguments.
    localizationClient.localize = function localize() {
      // gets arguments through and passes them to
      // i18next using sprintf to replace string placeholders
      // with arguments.
      const args = arguments;
      const value = i18n.t(...args);
      // If an array is used then a random value is selected
      if (Array.isArray(value)) {
        return value[Math.floor(Math.random() * value.length)];
      }
      return value;
    };
    // this gets the request attributes and save the localize function inside
    // it to be used in a handler by calling requestAttributes.t(STRING_ID, [args...])
    const attributes = handlerInput.attributesManager.getRequestAttributes();
    attributes.t = function translate(...args) {
      return localizationClient.localize(...args);
    }
  }
};

const skillBuilder = Alexa.SkillBuilders.custom();

exports.handler = skillBuilder
  .addRequestHandlers(
    GetNewFactHandler,
    HelpHandler,
    ExitHandler,
    FallbackHandler,
    SessionEndedRequestHandler,
  )
  .addRequestInterceptors(LocalizationInterceptor)
  .addErrorHandlers(ErrorHandler)
  .withCustomUserAgent('sample/basic-fact/v2')
  .lambda();

// TODO: Replace this data with your own.
// It is organized by language/locale.  You can safely ignore the locales you aren't using.
// Update the name and messages to align with the theme of your skill

const deData = {
  translation: {
    SKILL_NAME: 'Weltraumwissen',
    GET_FACT_MESSAGE: 'Hier sind deine Fakten: ',
    HELP_MESSAGE: 'Du kannst sagen, „Nenne mir einen Fakt über den Weltraum“, oder du kannst „Beenden“ sagen... Wie kann ich dir helfen?',
    HELP_REPROMPT: 'Wie kann ich dir helfen?',
    FALLBACK_MESSAGE: 'Die Weltraumfakten Skill kann dir dabei nicht helfen. Sie kann dir Fakten über den Raum erzählen, wenn du dannach fragst.',
    FALLBACK_REPROMPT: 'Wie kann ich dir helfen?',
    ERROR_MESSAGE: 'Es ist ein Fehler aufgetreten.',
    STOP_MESSAGE: 'Auf Wiedersehen!',
    FACTS:
      [
        'Ein Jahr dauert auf dem Merkur nur 88 Tage.',
        'Die Venus ist zwar weiter von der Sonne entfernt, hat aber höhere Temperaturen als Merkur.',
        'Venus dreht sich entgegen dem Uhrzeigersinn, möglicherweise aufgrund eines früheren Zusammenstoßes mit einem Asteroiden.',
        'Auf dem Mars erscheint die Sonne nur halb so groß wie auf der Erde.',
        'Jupiter hat den kürzesten Tag aller Planeten.',
      ],
  },
};

const dedeData = {
  translation: {
    SKILL_NAME: 'Weltraumwissen auf Deutsch',
  },
};

const enData = {
  translation: {
    SKILL_NAME: 'Space Facts',
    GET_FACT_MESSAGE: 'Here\'s your fact: ',
    HELP_MESSAGE: 'You can say tell me a space fact, or, you can say exit... What can I help you with?',
    HELP_REPROMPT: 'What can I help you with?',
    FALLBACK_MESSAGE: 'The Space Facts skill can\'t help you with that.  It can help you discover facts about space if you say tell me a space fact. What can I help you with?',
    FALLBACK_REPROMPT: 'What can I help you with?',
    ERROR_MESSAGE: 'Sorry, an error occurred.',
    STOP_MESSAGE: 'Goodbye!',
    FACTS:
      [

        'Spanish is the second official language, with 35.8 percent of speakers. The first language is English ... obviously ',
        'The emblematic tree of California is the Sequoia.',
        'The most emblematic animal is the grizzly bear from California. At this time, the only way to see one is to look at the flag of California. ',
        'Fallbrook grows more avocados than any other county and is known as the Avocado Capital. It hosts the annual avocado festival. ',
        'Indigenous tribes such as Yuma, Pomo, Paiute, Maidu and Hupa originally inhabited the state of California.',
        'California is the only state that has organized the Olympic Games twice. It has hosted the winter and summer Olympic Games. ',
        'California is the only state that has ever reached a billion dollar economy. The state even surpassed France in 2015 as the sixth world economy. ',
        'The first Spanish explorers named California after "Queen Calafia," a popular character in a Spanish novel called "The Esplandian Sergas," published in July 1510.',
        'California is one of the largest wine producing states in the United States. It produces 17 million gallons of wine a year. ',
        'The state of California grows half of all fruits and vegetables in the United States, such as avocados, peaches, grapes, lemons, tangerines, plums, prunes, kiwis, dates and onions.',
        'The California state fish is golden trout.',



      ],
  },
};

const enauData = {
  translation: {
    SKILL_NAME: 'Australian Space Facts',
  },
};

const encaData = {
  translation: {
    SKILL_NAME: 'Canadian Space Facts',
  },
};

const engbData = {
  translation: {
    SKILL_NAME: 'British Space Facts',
  },
};

const eninData = {
  translation: {
    SKILL_NAME: 'Indian Space Facts',
  },
};

const enusData = {
  translation: {
    SKILL_NAME: 'American Space Facts',
  },
};

const esData = {
  translation: {
    SKILL_NAME: 'Datos sobre California',
    GET_FACT_MESSAGE: 'Aquí está tu curiosidad: ',
    HELP_MESSAGE: 'Puedes decir dime una curiosidad y datos sobre california o puedes decir salir... Cómo te puedo ayudar?',
    HELP_REPROMPT: 'Como te puedo ayudar?',
    FALLBACK_MESSAGE: 'La skill datos sobre California no te puede ayudar con eso.  Te puede ayudar a descubrir curiosidades sobre California si dices dime una datos sobre California. Como te puedo ayudar?',
    FALLBACK_REPROMPT: 'Como te puedo ayudar?',
    ERROR_MESSAGE: 'Lo sentimos, se ha producido un error.',
    STOP_MESSAGE: 'Adiós!',
    FACTS:
        [
        'California es el estado más poblado de Estados Unidos, con casi 40 millones de habitantes. Solo seis millones menos que España.',
        'El español es la segunda lengua oficial, con un 35,8 por ciento de hablantes. La primera lengua es el inglés… obviusly.',
        'El árbol emblemático de California es la Secuoya.',
        'Animal más emblemático es el oso grizzly de California. En este momento, la única forma de ver uno es mirar la bandera de California.',
        'California tiene la mayor cantidad de parques nacionales en los Estados Unidos. Tiene nueve de los parques nacionales 59 en los Estados Unidos.Después de California, el estado con el segundo parque de parques es Alaska State, que tiene ocho parques nacionales.',
        'California aumenta más pavos que cualquier otro estado en los Estados Unidos.',
        'Fallbrook cultiva más aguacates que cualquier otro condado por lo que se conoce como la Capital del Aguacate. Alberga el festival anual de aguacate.',
        'Fallbrook cultiva más aguacates que cualquier otro condado por lo que se conoce como la Capital del Aguacate. Alberga el festival anual de aguacate.',
        'Las tribus indígenas como Yuma, Pomo, Paiute, Maidu y Hupa originalmente habitaban el estado de California.',
        'California es el único estado que ha organizado Juegos Olímpicos dos veces. Ha sido sede de los Juegos Olímpicos de invierno y verano.',
        'California es el único estado que alguna vez ha alcanzado una economía de un billón de dólares. El estado incluso superó a Francia en 2015 como la sexta economía mundial.',
        'Los primeros exploradores españoles nombraron a California después de "Queen Calafia", un personaje popular en una novela española llamada "Las sergas de Esplandian", publicada en julio 1510.',
        'El pez estatal de California es la trucha dorada.',
        'La bahía de San Francisco en California es conocida como el puerto sin salida al mar más grande del mundo.',
        'California es uno de los mayores estados productores de vino en los Estados Unidos. Produce 17 millones de galones de vino al año.',
        'El estado de California cultiva la mitad de todas las frutas y verduras en los Estados Unidos, como aguacates, melocotones, uvas, limones, mandarinas, ciruelas, ciruelas pasas, kiwis, dátiles y cebollas.',
        ],
  },
};

const esesData = {
  translation: {
    SKILL_NAME: 'Curiosidades del Espacio para España',
  },
};

const esmxData = {
  translation: {
    SKILL_NAME: 'Curiosidades del Espacio para México',
  },
};

const esusData = {
  translation: {
    SKILL_NAME: 'Datos sobre California',
  },
};

const frData = {
  translation: {
    SKILL_NAME: 'Anecdotes de l\'Espace',
    GET_FACT_MESSAGE: 'Voici votre anecdote : ',
    HELP_MESSAGE: 'Vous pouvez dire donne-moi une anecdote, ou, vous pouvez dire stop... Comment puis-je vous aider?',
    HELP_REPROMPT: 'Comment puis-je vous aider?',
    FALLBACK_MESSAGE: 'La skill des anecdotes de l\'espace ne peux vous aider avec cela. Je peux vous aider à découvrir des anecdotes sur l\'espace si vous dites par exemple, donne-moi une anecdote. Comment puis-je vous aider?',
    FALLBACK_REPROMPT: 'Comment puis-je vous aider?',
    ERROR_MESSAGE: 'Désolé, une erreur est survenue.',
    STOP_MESSAGE: 'Au revoir!',
    FACTS:
        [
          'Une année sur Mercure ne dure que 88 jours.',
          'En dépit de son éloignement du Soleil, Vénus connaît des températures plus élevées que sur Mercure.',
          'Sur Mars, le Soleil apparaît environ deux fois plus petit que sur Terre.',
          'De toutes les planètes, Jupiter a le jour le plus court.',
          'Le Soleil est une sphère presque parfaite.',
        ],
  },
};

const frfrData = {
  translation: {
    SKILL_NAME: 'Anecdotes françaises de l\'espace',
  },
};

const frcaData = {
  translation: {
    SKILL_NAME: 'Anecdotes canadiennes de l\'espace',
  },
};

const hiData = {
  translation: {
    SKILL_NAME: 'अंतरिक्ष facts',
    GET_FACT_MESSAGE: 'ये लीजिए आपका fact: ',
    HELP_MESSAGE: 'आप मुझे नया fact सुनाओ बोल सकते हैं या फिर exit भी बोल सकते हैं... आप क्या करना चाहेंगे?',
    HELP_REPROMPT: 'मैं आपकी किस प्रकार से सहायता कर सकती हूँ?',
    ERROR_MESSAGE: 'सॉरी, मैं वो समज नहीं पायी. क्या आप repeat कर सकते हैं?',
    STOP_MESSAGE: 'अच्छा bye, फिर मिलते हैं',
    FACTS:
      [
        'बुध गृह में एक साल में केवल अठासी दिन होते हैं',
        'सूरज से दूर होने के बावजूद, Venus का तापमान Mercury से ज़्यादा होता हैं',
        'Earth के तुलना से Mars में सूरज का size तक़रीबन आधा हैं',
        'सारे ग्रहों में Jupiter का दिन सबसे कम हैं',
        'सूरज का shape एकदम गेंद आकार में हैं'
      ],
  },
};

const hiinData = {
  translation: {
    SKILL_NAME: 'अंतरिक्ष फ़ैक्ट्स',
  },
}

const itData = {
  translation: {
    SKILL_NAME: 'Aneddoti dallo spazio',
    GET_FACT_MESSAGE: 'Ecco il tuo aneddoto: ',
    HELP_MESSAGE: 'Puoi chiedermi un aneddoto dallo spazio o puoi chiudermi dicendo "esci"... Come posso aiutarti?',
    HELP_REPROMPT: 'Come posso aiutarti?',
    FALLBACK_MESSAGE: 'Non posso aiutarti con questo. Posso aiutarti a scoprire fatti e aneddoti sullo spazio, basta che mi chiedi di dirti un aneddoto. Come posso aiutarti?',
    FALLBACK_REPROMPT: 'Come posso aiutarti?',
    ERROR_MESSAGE: 'Spiacenti, si è verificato un errore.',
    STOP_MESSAGE: 'A presto!',
    FACTS:
      [
        'Sul pianeta Mercurio, un anno dura solamente 88 giorni.',
        'Pur essendo più lontana dal Sole, Venere ha temperature più alte di Mercurio.',
        'Su Marte il sole appare grande la metà che su la terra. ',
        'Tra tutti i pianeti del sistema solare, la giornata più corta è su Giove.',
        'Il Sole è quasi una sfera perfetta.',
      ],
  },
};

const ititData = {
  translation: {
    SKILL_NAME: 'Aneddoti dallo spazio',
  },
};

const jpData = {
  translation: {
    SKILL_NAME: '日本語版豆知識',
    GET_FACT_MESSAGE: '知ってましたか？',
    HELP_MESSAGE: '豆知識を聞きたい時は「豆知識」と、終わりたい時は「おしまい」と言ってください。どうしますか？',
    HELP_REPROMPT: 'どうしますか？',
    ERROR_MESSAGE: '申し訳ありませんが、エラーが発生しました',
    STOP_MESSAGE: 'さようなら',
    FACTS:
      [
        '水星の一年はたった88日です。',
        '金星は水星と比べて太陽より遠くにありますが、気温は水星よりも高いです。',
        '金星は反時計回りに自転しています。過去に起こった隕石の衝突が原因と言われています。',
        '火星上から見ると、太陽の大きさは地球から見た場合の約半分に見えます。',
        '木星の<sub alias="いちにち">1日</sub>は全惑星の中で一番短いです。',
        '天の川銀河は約50億年後にアンドロメダ星雲と衝突します。',
      ],
  },
};

const jpjpData = {
  translation: {
    SKILL_NAME: '日本語版豆知識',
  },
};

const ptbrData = {
  translation: {
    SKILL_NAME: 'Fatos Espaciais',
  },
};

const ptData = {
  translation: {
    SKILL_NAME: 'Fatos Espaciais',
    GET_FACT_MESSAGE: 'Aqui vai: ',
    HELP_MESSAGE: 'Você pode me perguntar por um fato interessante sobre o espaço, ou, fexar a skill. Como posso ajudar?',
    HELP_REPROMPT: 'O que vai ser?',
    FALLBACK_MESSAGE: 'A skill fatos espaciais não tem uma resposta para isso. Ela pode contar informações interessantes sobre o espaço, é só perguntar. Como posso ajudar?',
    FALLBACK_REPROMPT: 'Eu posso contar fatos sobre o espaço. Como posso ajudar?',
    ERROR_MESSAGE: 'Desculpa, algo deu errado.',
    STOP_MESSAGE: 'Tchau!',
    FACTS:
      [
        'Um ano em Mercúrio só dura 88 dias.',
        'Apesar de ser mais distante do sol, Venus é mais quente que Mercúrio.',
        'Visto de marte, o sol parece ser metade to tamanho que nós vemos da terra.',
        'Júpiter tem os dias mais curtos entre os planetas no nosso sistema solar.',
        'O sol é quase uma esfera perfeita.',
      ],
  },
};

// constructs i18n and l10n data structure
const languageStrings = {
  'de': deData,
  'de-DE': dedeData,
  'en': enData,
  'en-AU': enauData,
  'en-CA': encaData,
  'en-GB': engbData,
  'en-IN': eninData,
  'en-US': enusData,
  'es': esData,
  'es-ES': esesData,
  'es-MX': esmxData,
  'es-US': esusData,
  'fr': frData,
  'fr-FR': frfrData,
  'fr-CA': frcaData,
  'hi': hiData,
  'hi-IN': hiinData,
  'it': itData,
  'it-IT': ititData,
  'ja': jpData,
  'ja-JP': jpjpData,
  'pt': ptData,
  'pt-BR': ptbrData,
};
