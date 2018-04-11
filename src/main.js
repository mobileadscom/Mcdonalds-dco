/* eslint-disable no-console */
/* global window, XMLHttpRequest */
import Mads from 'mads-custom';
import {getParamsFromJson, processMacrosInParams} from './js/getPropsFromJson';
import getEnvVars from './js/getConditions'

import './main.css';
import json from './config.js';


class AdUnit extends Mads {

  constructor(getLocally) {
    super();
    this.json = null;
    if (getLocally) {
      this.conditions = {};
      const inputs = document.querySelectorAll('input, select');
      for (const input of inputs) {
        const conditionName = input.id;
        this.conditions[conditionName] = input.value;
      }
    }
    else {
      getEnvVars.then(conditions => {
        console.log(conditions);
        this.doInit(conditions)});
    }
  }


  doInit(conditions) {
    const conditionsLowerCase = {};
    for (let i in conditions) {
      conditionsLowerCase[i] = conditions[i].toLowerCase();
    }
    this.params = getParamsFromJson(json, conditionsLowerCase);
    this.params = processMacrosInParams(this.params, conditions);
    this.finalRender();
    this.initForm(conditions);
  }


  initForm(conditions) {
    try {
        for (let i in conditions) {
            document.getElementById(i).value = conditions[i];
        }
    } catch (e) {}
  }


  render() {
    setTimeout(() => {
      this.doInit(this.conditions)
    }, 300);
    return `
      <div id="ad-container"></div>
    `;
  }


  finalRender() {
    const ad = this.params;

    const backgroundNode = ad.creative.type === "image" ?
      `<img id="ad-background" src="${ad.creative.url}" alt=""${ad.creative.style}>`
      :
      `<div id="ytplayer"></div>`;


    document.getElementById('ad-container').innerHTML = `
      ${backgroundNode}
      <!--<h1 id="ad-headline"${ad.headline.style}>${ad.headline.text}</h1>-->
      <img id="ad-headline" src="./img/logo.png" />
      <p id="ad-description"${ad.description.style}>${ad.description.text}</p>
      <a id="ad-cta"${ad.cta.style} target="_blank" href="${ad.cta.url}">${ad.cta.text}</a>
    `;

    document.getElementById('ad-container').className = ad.creative.type !== 'image' ? 'video-bg' : ''

    if (ad.creative.type === "video") {
      if (!window.loadYoutube) {
        // Load the IFrame Player API code asynchronously.
        var tag = document.createElement('script');
        tag.src = "https://www.youtube.com/player_api";
        var firstScriptTag = document.getElementsByTagName('script')[0];
        firstScriptTag.parentNode.insertBefore(tag, firstScriptTag);
        window.loadYoutube = true;
      
      // Replace the 'ytplayer' element with an <iframe> and
        // YouTube player after the API code downloads.
        var player;
        window.onYouTubePlayerAPIReady = function() {
          player = new YT.Player('ytplayer', {
            height: '300',
            width: '320',
            videoId: ad.creative.url,
            events: {
              'onReady': function() {
                document.getElementById('ytplayer').style.position = 'absolute';
                document.getElementById('ytplayer').style.top = '0px';
                document.getElementById('ytplayer').style.left = '0px';
              },
              'onStateChange': function(e) {
                if (e.data === YT.PlayerState.ENDED) {
                    player.playVideo(); 
                }
              }
            },
            playerVars: {
              controls: 0,
              loop: 1,
              playsinline: 1,
              rel: 0,
              autoplay: 1,
              showinfo: 0,
              modestbranding: 1,
              mute: 1
            }

          });
        }
      }
      else {
        window.onYouTubePlayerAPIReady();
      }
    }
  }

  // todo put styles here
  style() {
    return '';
  }

  events() {};

}

window.ad = new AdUnit();


window.AdUnit = AdUnit;
window.loadYoutube = false;