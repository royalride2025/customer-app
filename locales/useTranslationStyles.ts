import { useCallback, useMemo } from "react"
import { FlexAlignType, ViewStyle,FlexStyle, TextStyle } from "react-native"
import { useAppSelector } from "../src/redux/reduxHooks"


type textAlign = 'left' | 'right'

const useTranslationStyles = () => {

    const locale = useAppSelector(state=>state.language.language)

    const border = useMemo(()=>{
        return locale=='ar' ? {
            borderTopLeftRadius:8,
            borderTopRightRadius:0,
        }:{}
    },[locale])

    

    const flipImage = useMemo(()=>{
        return locale=='ar' ? {
            transform:[{scaleX:-1}],
            right:0,
            alignSelf:'flex-end',
            
        } : {}
    },[locale])

    const marginRightOrLeft =  useMemo(()=>{
        return locale=='ar' ? {
            marginRight:0 ,
            marginLeft:10
        }:{
            marginLeft:0,
            marginRight:10 ,
        }
    },[locale])
    const marginLeftorRight =  useMemo(()=>{
        return locale=='ar' ? {
            marginLeft:10 
        }:{
            marginLeft:10
        }
    },[locale])

   
    const margin = useCallback((number)=>{
        return locale == 'ar' ? {
            marginRight:number
        } : {
            
                marginLeft:number
            
        }
    },[locale])

    
    const alignSelf = useMemo(()=>{
        const Style:ViewStyle = {
            alignSelf:'flex-end'
        }
        return locale=='ar' ? Style : {}
    },[locale])

    const justifyContent = useMemo(()=>{
        const Style:ViewStyle = {
            justifyContent:'flex-end'
        }
        return locale=='ar' ? Style : {}
    },[locale])
    
    const flexDirection = useMemo(()=>{
        const Style:FlexStyle={
            flexDirection:'row-reverse'
        }
        if(locale=='ar'){
            return Style
        }else{
            const Style:FlexStyle={
                flexDirection:'row'
            }
            return Style
        }
        
    },[locale])

    const textAlignment = useMemo(()=>{
        const Style:TextStyle={
            textAlign:'right'
        }
        if(locale=='ar'){
            return Style
        }else{
            const Style:TextStyle={
                textAlign:'left'
            }
            return Style
        }
    },[locale])

    return {
        textAlignment,
        flexDirection,
        marginRightOrLeft,
        justifyContent,
        locale,
        margin,
        alignSelf,
        border,
        flipImage,
        marginLeftorRight
    }

}

export default useTranslationStyles