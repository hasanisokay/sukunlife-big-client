'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import Image from 'next/image'
import { Swiper, SwiperSlide } from 'swiper/react'
import { Pagination, Autoplay } from 'swiper/modules'
import 'swiper/css'
import 'swiper/css/pagination'
import { SERVER } from '@/constants/urls.mjs'

const SliderOnShopHeader = () => {
    const [topProducts, setTopProducts] = useState([])

    useEffect(() => {
        (async () => {
            try {
                const res = await fetch(`${SERVER}/api/public/top-sold-items?limit=3`)
                const data = await res.json()
                if (data.status === 200) {
                    setTopProducts(data.data)
                }
            } catch (err) {
                console.error('Failed to load top products:', err)
            }
        })()
    }, [])

    return (
        <div className="w-full max-w-6xl mx-auto mt-8 px-4 md:min-h-[405px] min-h-[336px]">
            <div className="relative">
                <Swiper
                    modules={[Pagination, Autoplay]}
                    pagination={{
                        clickable: true,
                        el: '.swiper-pagination-container', // Custom pagination container
                    }}
                    autoplay={{ delay: 3500 }}
                    loop
                    className="rounded-xl"
                >
                    {topProducts.map((product) => {
                        const randomImage =
                            product.images[Math.floor(Math.random() * product.images.length)]
                        return (
                            <SwiperSlide key={product._id} className='max-w-[1120px] h-[369px]'>
                                <Link href={`/shop/${product.productId}`}>
                                    <div className="relative w-full  md:h-[369px] h-[300px] cursor-pointer rounded-xl overflow-hidden">
                                        <Image
                                            src={randomImage}
                                            alt={product?.title}
                                            fill
                                            className="object-cover"
                                            priority
                                        />
                                        <div className="absolute bottom-0 w-full bg-black/40 text-white p-3">
                                            <h3 className="text-sm md:text-base font-semibold line-clamp-2">
                                                {product.title}
                                            </h3>
                                        </div>
                                    </div>
                                </Link>
                            </SwiperSlide>
                        )
                    })}
                </Swiper>
                <div className="swiper-pagination-container mt-4 flex justify-center"></div>
            </div>

            <style jsx global>{`
                .swiper-pagination-container {
                    position: relative;
                    height: 20px;
                }
                
                .swiper-pagination-container .swiper-pagination {
                    position: relative;
                    bottom: auto;
                    left: auto;
                    margin-top: 0;
                }

                .swiper-pagination-bullet {
                    width: 8px;
                    height: 8px;
                    background: #d1d5db;
                    opacity: 1;
                    transition: background 0.3s;
                    margin: 0 4px !important;
                }

                .swiper-pagination-bullet-active {
                    background: #63953A !important;
                }
            `}</style>
        </div>
    )
}

export default SliderOnShopHeader