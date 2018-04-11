// const conditionNames = ['time', 'day', 'language', 'device', 'os', 'country', 'city', 'weather'];


import {translations} from "./translations";

export function getParamsFromJson(json, conditionsLowercase) {

    function simpleCondition(query, branch) {
        const conditionValue = conditionsLowercase[query];
        for (const value in branch) {
            if (value.toLowerCase() === conditionValue) {
                return recursive(branch[value]);
            }
        }
        return eventuallyOther(branch);
    }

    function complexCondition(query, branch) {
        const queryParts = query.split('&&');
        const conditionParts = [];
        for (const query of queryParts) {
            conditionParts.push(conditionsLowercase[query]);
        }
        for (const value in branch) {
            const valueParts = value.split('&&').map(el => el.toLowerCase());
            if (conditionCheck(conditionParts, valueParts)) {
                return recursive(branch[value]);
            }
        }
        return eventuallyOther(branch);
    }

    function conditionCheck(conditionParts, valueParts) {
      for (let i = 0; i < conditionParts.length; i++) {
        const valuePart = valueParts[i];
        if (valuePart !== 'any') {
          const orParts = valuePart.split('|').map(el => el.toLowerCase());
          if (orParts.indexOf(conditionParts[i]) === -1) {
            return false;
          }
        }
      }
      return true;
    }

    function eventuallyOther(branch) {
        const otherBranch = branch.Other;
        if (otherBranch) {
            return recursive(otherBranch);
        }
        return '';
    }

    function recursive(branch) {
        if (typeof branch === 'string') {
            return branch;
        }
        const objectKeys = Object.keys(branch);
        if (objectKeys.length === 1) {
            const query = objectKeys[0];
            const subBranch = branch[query];
            if (query.indexOf('&&') === -1) {
                return simpleCondition(query, subBranch);
            }
            else {
                return complexCondition(query, subBranch);
            }
        }
        return branch;
    }


    const params = {};

    for (const paramName in json) {
        params[paramName] = recursive(json[paramName])
    }

    return params;
}


   
export function processMacrosInParams(params, conditions) {
    const replaceMacros = (string) => {
        let language = conditions.language;
        if (language === "English" || language === "Japanese") {
            language = false;
        }
        for (const i in conditions) {
            const condition = conditions[i];
            let translation;
            if (language || translations[language]) {
                translation = translations[language][condition] || condition;
            }
            else {
                translation = condition;
            }
            //todo this can be optimized
            string = string.replace('{{' + i + '}}', translation);
        }
        return string;
    };

    function getRandomItem(array) {
        const randomIndex = Math.floor(Math.random() * array.length);
        return replaceMacros(array[randomIndex]);
    }


    for (const paramName in params) {
        const param = params[paramName];
        if (typeof param === "string") {
            params[paramName] = {text: replaceMacros(param)};
        }
        else if (param instanceof Array) {
            params[paramName] = {text: getRandomItem(param)};
        }
        else {
            const text = param.text;
            if (typeof text === "string") {
                param.text = replaceMacros(text);
            }
            else if (text instanceof Array) {
                param.text = getRandomItem(text);
            }
        }

        if (param.url) {
            param.url = replaceMacros(param.url);
        }

        params[paramName].style = param.style ? ` style="${param.style}" ` : '';
    }

    return params;
}
