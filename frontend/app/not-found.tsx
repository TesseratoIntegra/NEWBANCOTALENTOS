import HomeLoader from '@/components/HomeLoader'
export default function NotFound(){
    return(
        <>
        <HomeLoader/>
        <div className='quicksand absolute -translate-1/2 left-1/2 top-1/2 z-50 text-center text-transparent bg-gradient-to-r from-blue-500 to-indigo-500 bg-clip-text'>
            <div className='text-5xl'>
                Not Found 404
            </div>
        </div>
        </>
    )
}