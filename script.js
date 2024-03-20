let reactantDiv = document.querySelector(".reactant");
let productDiv = document.querySelector(".product");
let addReactantButton = document.querySelector(".left-button");
let addProductButton = document.querySelector(".right-button");
let solveButton = document.querySelector(".solve-button");
let resetButton = document.querySelector(".reset-button");
let answerBox = document.querySelector(".answer");

function addReactant() {
    reactantDiv.innerHTML += '&nbsp;+&nbsp;<input class="left-input" type="text" />';
}

function addProduct() {
    productDiv.innerHTML += '&nbsp;+&nbsp;<input class="right-input" type="text" />';
}

function reset() {
    reactantDiv.innerHTML = '<input class="left-input" type="text" />';
    productDiv.innerHTML = '<input class="right-input" type="text" />';
    answerBox.innerHTML = '<p class="equation">สมการที่ดุลแล้วจะถูกแสดงที่นี่</p>';
    MathJax.Hub.Queue(["Typeset", MathJax.Hub, "answerBox"]);
}

function separateTextFromNumbers(text) {
    // ตัดตัวเลข
    const textWithoutNumbers = text.replace(/\d/g, '');
    // แยกตัวอักษรพิมพ์เล็ก/ใหญ่
    const separatedText = textWithoutNumbers.match(/[A-Z][a-z]*/g);
    return separatedText;
}

function convertString(string) {
    // ตรวจสอบว่ามีวงเล็บหรือไม่
    while (string.includes('(')) {
        // ใช้ regular expression เพื่อค้นหาวงเล็บและจำนวนอะตอมที่ตามหลัง
        let match = string.match(/\(([^\(\)]+)\)(\d+)/);
        if (match) {
            let inside = match[1];
            let count = parseInt(match[2]);
            // แปลง string ในวงเล็บ
            let insideConverted = convertString(inside);
            // แทนที่ string ในวงเล็บด้วย string ที่แปลงแล้ว
            string = string.replace(match[0], insideConverted.repeat(count));
        }
    }

    // ใช้ regular expression เพื่อแยกตัวอักษรและจำนวนอะตอม
    let atomCounts = string.match(/[A-Z][a-z]*\d*/g);
    let elements = {};

    // วนลูปเพื่อรวมจำนวนอะตอมของแต่ละองค์ประกอบ
    atomCounts.forEach(atomCount => {
        let match = atomCount.match(/([A-Z][a-z]*)(\d*)/);
        let atom = match[1];
        let count = match[2] === '' ? 1 : parseInt(match[2]);
        elements[atom] = (elements[atom] || 0) + count;
    });

    // สร้าง string ใหม่จากองค์ประกอบที่มีจำนวนอะตอมรวมแล้ว
    let result = Object.entries(elements)
        .map(([atom, count]) => count > 1 ? `${atom}${count}` : atom)
        .sort()
        .join('');

    return result;
}

function checkAtom(atom, molecule) {
    while (molecule.includes(atom)) {
        const index = molecule.indexOf(atom);
        const nextChar = molecule[index + atom.length];

        if (atom.length === 1 && nextChar && !/\d/.test(nextChar)) {
            if (nextChar.toLowerCase() === nextChar) {
                molecule = molecule.slice(0, index) + molecule.slice(index + 2);
            } else {
                return 1;
            }
        } else {
            let numStr = '';
            let i = index + atom.length;

            while (i < molecule.length && /\d/.test(molecule[i])) {
                numStr += molecule[i];
                i++;
            }

            return parseInt(numStr) || 1;
        }
    }
    return 0;
}

function diagonalize(M) {
    var m = M.length;
    var n = M[0].length;
    for (var k = 0; k < Math.min(m, n); ++k) {
        // Find the k-th pivot
        i_max = findPivot(M, k);
        if (M[i_max, k] == 0)
            throw "matrix is singular";
        swap_rows(M, k, i_max);
        // Do for all rows below pivot
        for (var i = k + 1; i < m; ++i) {
            // Do for all remaining elements in current row:
            var c = M[i][k] / M[k][k];
            for (var j = k + 1; j < n; ++j) {
                M[i][j] = M[i][j] - M[k][j] * c;
            }
            // Fill lower triangular matrix with zeros
            M[i][k] = 0;
        }
    }
}

function findPivot(M, k) {
    var i_max = k;
    for (var i = k + 1; i < M.length; ++i) {
        if (Math.abs(M[i][k]) > Math.abs(M[i_max][k])) {
            i_max = i;
        }
    }
    return i_max;
}

function swap_rows(M, i_max, k) {
    if (i_max != k) {
        var temp = M[i_max];
        M[i_max] = M[k];
        M[k] = temp;
    }
}

function makeM(A, b) {
    for (var i = 0; i < A.length; ++i) {
        A[i].push(b[i]);
    }
}

function substitute(M) {
    var m = M.length;
    for (var i = m - 1; i >= 0; --i) {
        var x = M[i][m] / M[i][i];
        for (var j = i - 1; j >= 0; --j) {
            M[j][m] -= x * M[j][i];
            M[j][i] = 0;
        }
        M[i][m] = x;
        M[i][i] = 1;
    }
}

function extractX(M) {
    var x = [];
    var m = M.length;
    var n = M[0].length;
    for (var i = 0; i < m; ++i) {
        x.push(M[i][n - 1]);
    }
    return x;
}

function solve(A, b) {
    makeM(A, b);
    diagonalize(A);
    substitute(A);
    var x = extractX(A);
    return x;
}

function shuffle(array) {
    let currentIndex = array.length, randomIndex;

    // While there remain elements to shuffle.
    while (currentIndex > 0) {

        // Pick a remaining element.
        randomIndex = Math.floor(Math.random() * currentIndex);
        currentIndex--;

        // And swap it with the current element.
        [array[currentIndex], array[randomIndex]] = [
            array[randomIndex], array[currentIndex]];
    }

    return array;
}

function decimalToFraction(decimal) {
    const tolerance = 1.0e-10;
    const sign = Math.sign(decimal); // เก็บเครื่องหมายของจำนวน
    decimal = Math.abs(decimal); // ทำให้จำนวนเป็นบวก

    let h1 = 1;
    let h2 = 0;
    let k1 = 0;
    let k2 = 1;
    let b = decimal;
    do {
        const a = Math.floor(b);
        const aux = h1;
        h1 = a * h1 + h2;
        h2 = aux;
        const aux2 = k1;
        k1 = a * k1 + k2;
        k2 = aux2;
        b = 1 / (b - a);
    } while (Math.abs(decimal - h1 / k1) > decimal * tolerance);

    const numerator = sign * h1; // นำเครื่องหมายมาใช้
    const denominator = k1;

    return numerator + "/" + denominator;
}

function convertToSubscript(inputList) {
    let subscriptList = [];

    for (let item of inputList) {
        let subscriptItem = "";
        let currentDigit = "";

        for (let char of item) {
            if (!isNaN(char)) {
                currentDigit += char;
            } else {
                if (currentDigit) {
                    subscriptItem += `_{${currentDigit}}`;
                    currentDigit = "";
                }
                subscriptItem += char;
            }
        }

        if (currentDigit) {
            subscriptItem += `_{${currentDigit}}`;
        }

        subscriptList.push(subscriptItem);
    }

    return subscriptList;
}

function balancing() {
    let reactants = document.querySelectorAll(".left-input");
    let products = document.querySelectorAll(".right-input");
    let oldReactantList = [];
    let oldProductList = [];

    reactants.forEach((box) => {
        oldReactantList.push(box.value);
    });
    products.forEach((box) => {
        oldProductList.push(box.value);
    });

    let reactantList = oldReactantList.map(convertString);
    let productList = oldProductList.map(convertString);

    const inputList = [...reactantList, ...productList];

    while (true) {
        let atomList = [];
        let coffMatrix = [];
        let constantMatrix = [];

        for (const item of inputList) {
            atomList = [...atomList, ...separateTextFromNumbers(item)];
        }

        atomList = [...new Set(atomList)]
        shuffle(atomList);
        popList = [];

        if (inputList.length - atomList.length > 1) {
            answerBox.innerHTML = "<p class='equation'>เลขสัมประสิทธิ์ที่สอดคล้องกับสมการนี้มีหลายได้หลายชุด</p>";
            return;
        }

        while (inputList.length - atomList.length !== 1) {
            popList.push(atomList.pop());
        }

        for (let i = 0; i < atomList.length; i++) {
            coffMatrix.push([]);
        }

        for (const atom of atomList) {
            for (const r of reactantList) {
                coffMatrix[atomList.indexOf(atom)].push(checkAtom(atom, r));
            }

            for (const p of productList) {
                if (productList.indexOf(p) === productList.length - 1) {
                    constantMatrix.push(checkAtom(atom, p));
                } else {
                    coffMatrix[atomList.indexOf(atom)].push(-checkAtom(atom, p));
                }
            }
        }

        var x = solve(coffMatrix, constantMatrix);
        x.push(1);

        let xFrac = [];
        let Answer = true;

        for (const ans of x) {
            if (isNaN(ans)) {
                Answer = false;
                break;
            } else {
                xFrac.push(decimalToFraction(ans));
            }
        }

        // Extract denominators and calculate LCM
        const Denominators = xFrac.map(frac => parseInt(frac.split('/')[1]));
        // Function to calculate greatest common divisor
        function gcd(a, b) {
            return b === 0 ? a : gcd(b, a % b);
        }
        const lcm = Denominators.reduce((a, b) => a * b / gcd(a, b), 1);

        // Convert string fractions to decimals
        const decimals = xFrac.map(frac => eval(frac));

        // Multiply decimals by LCM to get coffAnswer
        const coffAnswer = decimals.map(decimal => Math.round(decimal * lcm));

        let subReactantList = convertToSubscript(oldReactantList);
        let subProductList = convertToSubscript(oldProductList);

        // Create the chemical equation
        let equation = coffAnswer.slice(0, subReactantList.length).map((coff, index) => {
            let reactant = subReactantList[index];
            return `${coff !== 1 ? coff : ''}${reactant}`;
        }).join(" + ");

        // Add the equals sign
        equation += " \\longrightarrow ";

        // Add the productList part
        equation += coffAnswer.slice(subReactantList.length).map((coff, index) => {
            let product = subProductList[index];
            return `${coff !== 1 ? coff : ''}${product}`;
        }).join(" + ");

        latexEquation = "<p class='equation'>$$ " + equation + " $$</p>";

        if (Answer) {
            let leftCoff = x.slice(0, reactantList.length);
            let rightCoff = x.slice(reactantList.length);
            let popCheck = 0;

            for (const e of popList) {
                for (const r of reactantList) {
                    popCheck += checkAtom(e, r) * leftCoff[reactantList.indexOf(r)];
                }

                for (const p of productList) {
                    popCheck -= checkAtom(e, p) * rightCoff[productList.indexOf(p)];
                }

                if (Math.floor(Math.abs(popCheck)) !== 0) {
                    answerBox.innerHTML = "<p class='equation'>ไม่มีเลขสัมประสิทธิ์ที่สอดคล้องกับสมการนี้ (สมการไม่ถูกต้อง)</p>";
                    return;
                }
            }

            answerBox.innerHTML = latexEquation;
            MathJax.Hub.Queue(["Typeset", MathJax.Hub, "answerBox"]);
            break;
        }
    }
}

addReactantButton.addEventListener('click', addReactant);
addProductButton.addEventListener('click', addProduct);
resetButton.addEventListener('click', reset);
solveButton.addEventListener('click', balancing);