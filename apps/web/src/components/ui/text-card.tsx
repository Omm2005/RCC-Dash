import {
  Card,
  CardContent,
} from "@/components/ui/card";

export const TextCard = ({desc}: {desc: React.ReactNode}) => {
    return(
        <>
            <Card>
            <CardContent className="p-4 whitespace-pre-line" >
                <p className="font-medium">{desc}</p>
            </CardContent>
            </Card>
        </>
    );
}

