// -------------- For prefers-color-scheme on load -------------- //
function themeOnLoad() {
    if (window.matchMedia && window.matchMedia('(prefers-color-scheme: light)').matches) {
        document.getElementsByTagName('body')[0].classList.toggle("light-theme");
    } 
}
window.onload = themeOnLoad();


// ------------ For toggling between day & night mode ------------ //
document.getElementById("toggle").addEventListener("click", () => { //Have to target the input not label
    document.getElementsByTagName('body')[0].classList.toggle("light-theme");
});


// ---------- Changing play button SVG element on hover ---------- //
const svgElement = document.querySelector("#word-section button svg"),
      circleElement = svgElement.querySelector("g circle"),
      pathElement = svgElement.querySelector("g path");

svgElement.addEventListener("mouseover", () => {
  circleElement.style.opacity = 1;
  pathElement.style.fill = "white";
});

svgElement.addEventListener("mouseout", () => {
  circleElement.style.opacity = "";
  pathElement.style.fill = "";
});


// ------------ Changing dropdown select menu ------------ //
const body = document.querySelector("body"),
      searchInput = document.querySelector("#search-input"),
      select = document.querySelector(".select"),
      options_list = document.querySelector(".options-list"),
      options = document.querySelectorAll(".option");

//show & hide options list
select.addEventListener("click", () => {
  options_list.classList.toggle("active");
});

//select option
options.forEach((option) => {
  option.addEventListener("click", () => {
    options.forEach((option) => {
      option.classList.remove('selected')
    });
    select.querySelector("span").innerHTML = option.innerHTML;
    option.classList.add("selected");
    options_list.classList.toggle("active");

    if (option.textContent === "Serif") {
      body.style.fontFamily = "'Lora', sans-serif";
      searchInput.style.fontFamily = "'Lora', sans-serif";
    } else if (option.textContent === "Mono") {
      body.style.fontFamily = "'Inconsolata', sans-serif";
      searchInput.style.fontFamily = "'Inconsolata', sans-serif";
    } else {
      body.style.fontFamily = "'Inter', sans-serif";
      searchInput.style.fontFamily = "'Inter', sans-serif";
    }
  });
});


// ------------------- Dictionary API ------------------- //
const searchBtn = document.querySelector("#search-btn"),
      searchbarSubSection = document.querySelector("#searchbar-sub-section"),
      errMsg = document.querySelector("#err-msg"),
      wordSection = document.querySelector("#word-section"),
      definitionSection = document.querySelector("#definition-section"),
      errSection = document.querySelector("#error-section");


function findWord() {
  searchBtn.addEventListener("click", () => {

    if (searchInput.value === "") {
      errMsg.style.display = 'block';
      searchbarSubSection.classList.add('border-red');
    } else {
      errMsg.style.display = 'none';
      searchbarSubSection.classList.remove('border-red');

      let wordInput = searchInput.value.toLowerCase();
      let wordURL = `https://api.dictionaryapi.dev/api/v2/entries/en/${wordInput}`;

      fetch (wordURL)
        .then(response => {
          if (!response.ok) {
            throw new Error('Network response was not OK');
          }
          return response.json();
        })

        .then(data => {
          if (data.error) {
            console.log("error found");
            errSection.style.display = "block";
            wordSection.style.display = "none";
            definitionSection.style.display = "none";
          } else {
            errSection.style.display = "none";
            wordSection.style.display = "flex";
            definitionSection.style.display = "block";

            //wordSection --------------------------------------
            let wordText = document.querySelector("#word-text"),
                wordPronounce = document.querySelector("#word-pronounce"),
                playBtn = document.querySelector("#word-section button");

            wordText.textContent = data[0].word;

            for (let p=0; p<data[0].phonetics.length; p++) {
              if (data[0].phonetics[p].text && data[0].phonetics[p].text !== "" && data[0].phonetics[p].audio && data[0].phonetics[p].audio !== "") {
                wordPronounce.textContent = data[0].phonetics[p].text;
                playBtn.src = data[0].phonetics[p].audio;
                break; // So as to take only the first instance where both text and audio exist and are not empty
              }
            }
            // Add event listener to playBtn
            playBtn.addEventListener("click", () => {
              playSound(playBtn.src);
            });

            //definitionSection --------------------------------
            definitionSection.innerHTML = ""; //To reset the content when user straightaway types another word

            //create a new list from meanings as there are repeated 'partOfSpeech' in the API responses
            mergedMeanings = []; 

            for (let m=0; m<data[0].meanings.length; m++) {

              const currentDict = data[0].meanings[m];
              let merged = false;

              for (let j = 0; j < mergedMeanings.length; j++) {
                let mergedDict = mergedMeanings[j];
                if (currentDict.partOfSpeech === mergedDict.partOfSpeech) {
                  mergedDict.definitions = mergedDict.definitions.concat(currentDict.definitions);
                  mergedDict.synonyms = mergedDict.synonyms.concat(currentDict.synonyms);
                  mergedDict.antonyms = mergedDict.antonyms.concat(currentDict.antonyms);
                  merged = true;
                  break;
                }
              }
            
              if (!merged) {
                mergedMeanings.push(currentDict);
              }
            }
            // console.log(mergedMeanings);


            //loop through the mergedMeanings and add the definitions to the section
            for (let m=0; m<mergedMeanings.length; m++) { 
              //create a div for each partOfSpeech box e.g. noun, verb, adverb if any
              const partBox = document.createElement('div');

              //create elements within each partBox div (synonym & antonym will be added later, if only there is info about them)
              const partOfSpeechType = document.createElement('span'),
                    meaningTitle = document.createElement('span'),
                    meaningList = document.createElement('ul');
              
              partBox.classList.add('part-of-speech');
              partBox.setAttribute('id', mergedMeanings[m].partOfSpeech);

              
              partOfSpeechType.classList.add('type');
              partOfSpeechType.innerHTML = `<em>${mergedMeanings[m].partOfSpeech}</em><hr>`;
              partBox.appendChild(partOfSpeechType);


              meaningTitle.classList.add('gray-text');
              meaningTitle.textContent = 'Meaning';
              partBox.appendChild(meaningTitle);
              

              for (let d=0; d<mergedMeanings[m].definitions.length; d++) {
                const meaningLi = document.createElement('li');
                const meaningLiP = document.createElement('p');

                meaningLiP.textContent = mergedMeanings[m].definitions[d].definition;
                meaningLi.appendChild(meaningLiP);

                if (mergedMeanings[m].definitions[d].example) {
                  const meaningLiSpan = document.createElement('span');
                  meaningLiSpan.classList.add('example');
                  meaningLiSpan.textContent = `"${mergedMeanings[m].definitions[d].example}"`;
                  meaningLi.appendChild(meaningLiSpan);
                }
                meaningList.appendChild(meaningLi);
              }
              partBox.appendChild(meaningList);


              if (mergedMeanings[m].synonyms && mergedMeanings[m].synonyms.length > 0) {
                const synonymDiv = document.createElement('div');
                synonymDiv.classList.add('synonym-div');

                const synonymTitle = document.createElement('span');
                synonymTitle.classList.add('gray-text');
                synonymTitle.classList.add('synonym-title');
                synonymTitle.textContent = "Synonyms";

                const synonymWords = document.createElement('span');
                synonymWords.classList.add('synonym-words');
                synonymWords.textContent = mergedMeanings[m].synonyms.join(", "); //to convert the array of synonyms into a comma separated string

                synonymDiv.appendChild(synonymTitle);
                synonymDiv.appendChild(synonymWords);

                partBox.appendChild(synonymDiv);
              }


              if (mergedMeanings[m].antonyms && mergedMeanings[m].antonyms.length > 0) {
                const antonymDiv = document.createElement('div');
                antonymDiv.classList.add('antonym-div');

                const antonymTitle = document.createElement('span');
                antonymTitle.classList.add('gray-text');
                antonymTitle.classList.add('antonym-title');
                antonymTitle.textContent = "Antonyms";

                const antonymWords = document.createElement('span');
                antonymWords.classList.add('antonym-words');
                antonymWords.textContent = mergedMeanings[m].antonyms.join(", "); //to convert the array of antnonyms into a comma separated string

                antonymDiv.appendChild(antonymTitle);
                antonymDiv.appendChild(antonymWords);

                partBox.appendChild(antonymDiv);
              } 

              definitionSection.appendChild(partBox);
            }

            //definitionSection - hr line ----------------------
            const hrLine = document.createElement('hr');
            hrLine.setAttribute('id', 'full-line');
            definitionSection.appendChild(hrLine);

            //definitionSection - source section ---------------
            const source = document.createElement('div');
            source.setAttribute('id', 'source-section');

            const sourceTitle = document.createElement('span');
            sourceTitle.setAttribute('id', 'gray-text-source');
            sourceTitle.textContent = "Source";

            const sourceLink = document.createElement('a');
            sourceLink.href = `https://en.wiktionary.org/wiki/${wordInput}`;
            sourceLink.target = "_blank";
            sourceLink.textContent = `https://en.wiktionary.org/wiki/${wordInput}`;

            const imgNewWindow = document.createElement('img');
            imgNewWindow.src = "./starter-code/assets/images/icon-new-window.svg";
            imgNewWindow.alt = "icon-new-window";
            sourceLink.appendChild(imgNewWindow);

            source.appendChild(sourceTitle);
            source.appendChild(sourceLink);
            definitionSection.appendChild(source);
          }
        })

        .catch(error => {
          console.error('Error:', error);
          errSection.style.display = "block";
          wordSection.style.display = "none";
          definitionSection.style.display = "none";
        });
    }
  });
}

findWord();


function playSound(url) {
  let audio = new Audio(url);
  audio.play();
}