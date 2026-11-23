// function addSum(a,b)
// {
//     return a+b
// }
// const nums =[5,6]
// const sum=addSum(...nums)
// console.log(sum)

function reorderFunc(firstUser, ...others)
{
 return [ ...others,firstUser]
}
    const users=['Tim','Alex','Jame','Jake','Wellys','Qwerty'];

    const array= reorderFunc(...users)
    console.log(array)



function getLength(str) {
    return str.length;
}
const variable=getLength('')
console.log(variable);


function palindrome(str){
    str = str.toLowerCase();
    return str === str.split('').reverse().join('');
}
console.log(palindrome('racecar'))

// function FizzBuzz(n){
//     for(let i=1; i<=n;i++)
//     {
//     if(i % 3 === 0 && i % 5 === 0){
//         console.log('fizzbuzz');
//     }
//     else if(i % 5 === 0){
//         console.log('buzz');
//     }
//     else if(i % 3 === 0){
//         console.log('fizz');
//     }
//     else{
//         console.log(i);
//     }
//     }
// }
// FizzBuzz(19)


function Anagrama(str1, str2)
{
    const normalize = str => 
        str.toLowerCase().replace(/[^a-z0-9]/g,'').split('').sort().join('');

    return normalize(str1)===normalize(str2);
}
console.log(Anagrama("Listen", "Silnt"));   

function countVowels(str)
{
    const vowels=['a','e','i','o','u'];
    let count=0;
    let str2 = str.toLowerCase();
    for(let char of str2)
    {
        if(vowels.includes(char)){
            count++;
        }
    }
    return count;
}
console.log(countVowels('qwertaiou'))


function Fibonachi(n){
  if (n === 0) return 0;
  if (n === 1) return 1;
    let res=[0,1];
    for(let i=2;i<=n;i++)
    {
       let next = res[i - 1] + res[i - 2];
       res.push(next);
    }
    return res[res.length-1];
}
console.log(Fibonachi(6))

function fibonachi(num){
    if(num<2)
        return num
return fibonachi(num-1)+fibonachi(num-2)
}
console.log(fibonachi(6))