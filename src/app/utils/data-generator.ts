import { faker } from '@faker-js/faker'

//NOTE: Reference of available values 
//https://fakerjs.dev/api/
export class DataGenerator {

  public static processString(input: string): string {
    console.log("Data generator processing input");
    console.log(input);

    //Datatypes
    input = this.replaceTokens(input, "$UUID$", faker.datatype.uuid);
    input = this.replaceTokens(input, "$STRING$", faker.datatype.string);
    input = this.replaceTokens(input, "\"$NUMBER$\"", faker.datatype.number);
    input = this.replaceTokens(input, "\"$BIG_NUMBER$\”", faker.datatype.bigInt);
    input = this.replaceTokens(input, "\"$FLOAT$\"", faker.datatype.float);
    input = this.replaceTokens(input, "$DATE$", faker.datatype.datetime);

    //Names
    input = this.replaceTokens(input, "$FIRST_NAME$", faker.name.firstName);
    input = this.replaceTokens(input, "$LAST_NAME$", faker.name.lastName);
    input = this.replaceTokens(input, "$FULL_NAME$", faker.name.fullName);

    //Finnance
    input = this.replaceTokens(input, "\"$AMOUNT$\"", DataGenerator.integerAmount);
    input = this.replaceTokens(input, "$CARD_NUMBER$", faker.finance.creditCardNumber);
    input = this.replaceTokens(input, "$ACCOUNT_NUMBER$", faker.finance.account);

    //Address
    input = this.replaceTokens(input, "$COUNTRY$", faker.address.country);
    input = this.replaceTokens(input, "$CITY$", faker.address.city);
    input = this.replaceTokens(input, "$STREET$", faker.address.streetAddress);

    //Company
    input = this.replaceTokens(input, "$COMPANY_NAME$", faker.company.name);

    //Phone
    input = this.replaceTokens(input, "$PHONE_NUMBER$", faker.phone.number);

    //Lorem
    input = this.replaceTokens(input, "$SENTENCE$", faker.lorem.sentence);
  
    console.log("Data generator processing output");
    console.log(input);

    return input;
  }  

  private static integerAmount(): string {
    return faker.finance.amount(100, 1000000, 0);
  }

  private static replaceTokens(subject: string, token: string, source: Function): string {
    while (subject.includes(token)){
      subject = subject.replace(token, source());
    }
    return subject;
  }

}