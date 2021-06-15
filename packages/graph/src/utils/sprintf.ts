export function sprintf(myinput: string, args:string[]): string {
    for(var i = 0;i<args.length;i++) { 
        let idx = myinput.indexOf("%s");
        let strend = myinput.slice(idx+2);
        let strstart = myinput.slice(0, idx).concat(args[i]);
        myinput = strstart.concat(strend)
    }
    return myinput
}
