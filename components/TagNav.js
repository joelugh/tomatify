import Link from "next/link";
import { Button, Typography } from "@material-ui/core";
import { Emoji } from "emoji-mart";

function TagNav(props) {

    const SIZE = 12;
    const MARGIN = 0;
    const PADDING = 4;

    return <div style={{display:'flex', flexWrap:'wrap', justifyContent:'center', margin: 10}}>
        <div>
            <Link href="/tags/[id]" as={`/tags/hatching_chick`}>
                <Button size="small" style={{marginLeft:MARGIN,marginRight:MARGIN}}>
                    <Emoji native emoji="hatching_chick" size={SIZE} />
                    <Typography variant="caption" style={{paddingLeft:PADDING}}>New</Typography>
                </Button>
            </Link>
            <Link href="/tags/[id]" as={`/tags/fire`}>
                <Button size="small" style={{marginLeft:MARGIN,marginRight:MARGIN}}>
                    <Emoji native emoji="fire" size={SIZE} />
                    <Typography variant="caption" style={{paddingLeft:PADDING}}>Hot</Typography>
                </Button>
            </Link>
            <Link href="/tags/[id]" as={`/tags/100`}>
                <Button size="small" style={{marginLeft:MARGIN,marginRight:MARGIN}}>
                    <Emoji native emoji="100" size={SIZE} />
                    <Typography variant="caption" style={{paddingLeft:PADDING}}>Top</Typography>
                </Button>
            </Link>
        </div>
        <div>
            <Link href="/tags/[id]" as={`/tags/microphone`}>
                <Button size="small" style={{marginLeft:MARGIN,marginRight:MARGIN}}>
                    <Emoji native emoji="microphone" size={SIZE} />
                    <Typography variant="caption" style={{paddingLeft:PADDING}}>Artists</Typography>
                </Button>
            </Link>
            <Link href="/tags/[id]" as={`/tags/cd`}>
                <Button size="small" style={{marginLeft:MARGIN,marginRight:MARGIN}}>
                    <Emoji native emoji="cd" size={SIZE} />
                    <Typography variant="caption" style={{paddingLeft:PADDING}}>Albums</Typography>
                </Button>
            </Link>
        </div>
    </div>

}

export default TagNav;