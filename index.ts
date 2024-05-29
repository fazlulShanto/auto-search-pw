import { chromium, devices } from "playwright";
interface ISearchResult {
    title: string;
    description?: string;
    link: string;
}
interface IBrowserConfigs{
    headless?: boolean,
    screen?: {
        width: number
        height: number
    }
};

const getDuckduckgoSearchResult = async (searchQuery:string, configs: IBrowserConfigs ) => {

    const defaultConfig= {
        headless: false,
        screen: {
            width: 720,
            height: 720,
        }
    };

    const finalConfig = Object.assign(defaultConfig, configs);


    const searchEngineUrl: string = "https://duckduckgo.com/";

    const searchBoxSelector = `#searchbox_input`;

    const browser = await chromium.launch({
        headless: finalConfig.headless,
    });

    const context = await browser.newContext({
        screen: {
            width: finalConfig.screen.width,
            height: finalConfig.screen.height,
        },
    });

    const page = await context.newPage();

    await page.goto(searchEngineUrl);

    await page.waitForLoadState("networkidle");

    const searchBox = page.locator(searchBoxSelector);

    await searchBox.fill(searchQuery);

    await searchBox.press("Enter");

    const searchResultSelector = `[data-testid="result"]`;
    // const searchResultSelector = `[data-area="mainline"] > ol > li`;

    await page.waitForSelector(searchResultSelector);

    const searchList = await page.locator(searchResultSelector).all();

    const formatedResult: ISearchResult[] = [];

    for (const element of searchList) {
        const title = await element
            .locator('[data-testid="result-title-a"]')
            .innerText();
        const description = await element
            .locator('[data-result="snippet"]')
            .innerText();
        const link = await element
            .locator('[data-testid="result-title-a"]')
            .getAttribute("href");

        if (title && link) {
            formatedResult.push({
                title,
                description,
                link,
            });
        } else {
            //show error
            continue;
        }
    }
    return formatedResult;
};

const main = async ()=>{
    try {
        const result = await getDuckduckgoSearchResult("Bangladesh",{headless:true});
        console.log(result);
    } catch (error) {
        console.log(error);
    }
}

main();
