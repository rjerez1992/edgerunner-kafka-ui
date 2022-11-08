import { faker } from '@faker-js/faker'

export class GeneralUtils {

  //USAGE: this.delay(10 * 1000).then(() => {});
  public static async delay(ms: number) {
    await new Promise<void>(resolve => setTimeout(()=>resolve(), ms)).then(()=>console.log("Delay trigger fired"));
  }

  public static getFunnyNameFor(name: string): string{
    return faker.word.adverb() + "-" + faker.word.adjective() + "-" + name;
  }

  public static getFunnyShortName(): string{
    return faker.word.adjective() + "-" + faker.animal.type();
  }

  public static getFunnyName(): string{
    return faker.word.adverb() + "-" + faker.word.adjective() + "-" + faker.animal.type();
  }
}