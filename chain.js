// The chain is a list of people. Each person is a JSON object with several fields.
var chain = []

// The starting point for a run of the program. Adds a person to the chain.
function addToChain() {
    // First run?
    if (chain.length == 0) {
        // Then get the date entered by the user.
        var startDate = document.getElementById('startDate').value
        if (startDate == '') {
            alert('Enter a valid date')
            return
        }
        runQuery(startDate)
    } else {
        // If the chain already has people in it, get the last one and use their birthdate.
        lastPerson = chain[chain.length - 1]
        lastPersonDate = lastPerson.dob.value
        runQuery(lastPersonDate)
    }
}

function runQuery(date) {
    document.getElementById('go').disabled = true
    var query = buildQuery(date)
    var url = wdk.sparqlQuery(query)
    var xmlhttp = new XMLHttpRequest();

    xmlhttp.onreadystatechange = function() {
        if (xmlhttp.readyState == 4 && xmlhttp.status == 200) {
            var response = JSON.parse(xmlhttp.responseText)
            var people = response.results.bindings

            if (people.length == 0) {
                alert('End of the chain reached!')
                return
            }

            var newPerson = getRandomPerson(people)

            addPerson(newPerson)
            updateTable(newPerson)

            document.getElementById('go').disabled = false
        }
    }

    xmlhttp.open("GET", url, true);
    xmlhttp.send();
}

function getRandomPerson(results) {
    var i = getRandomInt(0, results.length - 1)
    return results[i]
}

function getRandomInt(min, max) {
    return Math.floor(Math.random() * (max - min + 1)) + min;
}

function addPerson(newPerson) {
    chain.push(newPerson)
}

function buildQuery(date)
{
    return `
PREFIX wd: <http://www.wikidata.org/entity/>
PREFIX wdt: <http://www.wikidata.org/prop/direct/>

SELECT DISTINCT ?h ?dob ?dod ?hLabel ?hDescription ?article
WHERE
{
?h wdt:P31 wd:Q5 .
?h wdt:P569 ?dob .
?h wdt:P570 ?dod .
OPTIONAL {
    ?h schema:description ?hDescription .
    ?article schema:inLanguage "en" .
    ?article schema:about ?h
}
FILTER (?dod = "${date}"^^xsd:dateTime)

SERVICE wikibase:label {
    bd:serviceParam wikibase:language "en" .
}

}
LIMIT 50
`
}

function updateTable(person) {
    var displayTable = document.getElementById('outputTable')
    var row = displayTable.insertRow(-1)

    var nameCell = row.insertCell(0)
    var dobCell = row.insertCell(1)
    var dodCell = row.insertCell(2)
    var descCell = row.insertCell(3)

    var nameLink =
        `<a href='${person.article.value}'>${person.hLabel.value}</a>`

    if (person.hLabel != null) {
        nameCell.innerHTML = nameLink
    }
    if (person.dob != null) {
        dobCell.innerHTML = person.dob.value
    }
    if (person.dod != null) {
        dodCell.innerHTML = person.dod.value
    }
    if (person.hDescription != null) {
        descCell.innerHTML = person.hDescription.value
    }
}
